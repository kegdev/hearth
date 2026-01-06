#!/usr/bin/env python3
"""
HomeBox to Hearth Import Script

This script imports data from a HomeBox CSV export into Hearth via Firebase.
It creates containers based on locations and imports items with full metadata.

Usage:
    python homebox_import.py --csv ~/Downloads/homebox-items_YYYY-MM-DD_HH-MM-SS.csv --preview
    python homebox_import.py --csv ~/Downloads/homebox-items_YYYY-MM-DD_HH-MM-SS.csv --import --user-id YOUR_USER_ID

Requirements:
    pip install firebase-admin pandas python-dotenv
"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional, Any
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("❌ Firebase Admin SDK not installed. Run: pip install firebase-admin")
    sys.exit(1)

class HomeBoxImporter:
    def __init__(self, csv_path: str, user_id: str = None):
        self.csv_path = csv_path
        self.user_id = user_id
        self.db = None
        self.containers_created = {}
        self.items_imported = 0
        self.errors = []
        
    def initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Try to use service account key if available
            service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            else:
                # Use default credentials (for local development)
                firebase_admin.initialize_app()
            
            self.db = firestore.client()
            print("✅ Firebase initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            print("💡 Make sure you have:")
            print("   1. Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable")
            print("   2. Or run 'gcloud auth application-default login'")
            return False
    
    def load_csv_data(self) -> List[Dict]:
        """Load and parse the HomeBox CSV export"""
        try:
            df = pd.read_csv(self.csv_path)
            print(f"📊 Loaded {len(df)} items from CSV")
            
            # Convert to list of dictionaries for easier processing
            items = df.to_dict('records')
            
            # Clean up the data
            for item in items:
                # Handle NaN values
                for key, value in item.items():
                    if pd.isna(value):
                        item[key] = None
                    elif isinstance(value, str):
                        item[key] = value.strip()
            
            return items
            
        except Exception as e:
            print(f"❌ Error loading CSV: {e}")
            return []
    
    def analyze_data(self, items: List[Dict]) -> Dict:
        """Analyze the HomeBox data to understand structure"""
        locations = {}
        labels_set = set()
        
        for item in items:
            location = item.get('HB.location', '').strip()
            if location:
                if location not in locations:
                    locations[location] = []
                locations[location].append(item)
            
            # Parse labels (tags)
            labels = item.get('HB.labels', '')
            if labels:
                # Split by semicolon and clean up
                item_labels = [label.strip() for label in labels.split(';') if label.strip()]
                labels_set.update(item_labels)
        
        return {
            'locations': locations,
            'all_labels': sorted(list(labels_set)),
            'total_items': len(items)
        }
    
    def preview_import(self, items: List[Dict]):
        """Preview what would be imported without actually importing"""
        analysis = self.analyze_data(items)
        
        print("\n🔍 IMPORT PREVIEW")
        print("=" * 50)
        print(f"Total items to import: {analysis['total_items']}")
        print(f"Containers to create: {len(analysis['locations'])}")
        
        print("\n📦 CONTAINERS (by location):")
        for location, location_items in analysis['locations'].items():
            print(f"  • {location}: {len(location_items)} items")
        
        print(f"\n🏷️  AVAILABLE LABELS ({len(analysis['all_labels'])}):")
        for i, label in enumerate(analysis['all_labels'][:20]):  # Show first 20
            print(f"  • {label}")
        if len(analysis['all_labels']) > 20:
            print(f"  ... and {len(analysis['all_labels']) - 20} more")
        
        print("\n📋 SAMPLE ITEMS:")
        for i, item in enumerate(items[:3]):  # Show first 3 items
            print(f"\n  Item {i+1}: {item.get('HB.name', 'Unnamed')}")
            print(f"    Location: {item.get('HB.location', 'None')}")
            print(f"    Labels: {item.get('HB.labels', 'None')}")
            print(f"    Description: {item.get('HB.description', 'None')[:100]}...")
            print(f"    Purchase Price: ${item.get('HB.purchase_price', 0)}")
            print(f"    Manufacturer: {item.get('HB.manufacturer', 'None')}")
            print(f"    Model: {item.get('HB.model_number', 'None')}")
        
        print("\n💡 To proceed with import, run with --import flag and --user-id")
    
    def create_container(self, location: str, items_count: int) -> Optional[str]:
        """Create a container in Hearth for the given location"""
        if not self.db or not self.user_id:
            return None
        
        try:
            container_data = {
                'name': location,
                'description': f'Imported from HomeBox - Contains {items_count} items',
                'location': 'Imported from HomeBox',
                'userId': self.user_id,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP,
                'imageUrl': None
            }
            
            # Add to Firestore
            doc_ref = self.db.collection('containers').add(container_data)
            container_id = doc_ref[1].id
            
            print(f"✅ Created container: {location} (ID: {container_id})")
            return container_id
            
        except Exception as e:
            error_msg = f"Failed to create container '{location}': {e}"
            print(f"❌ {error_msg}")
            self.errors.append(error_msg)
            return None
    
    def parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse HomeBox date format"""
        if not date_str or str(date_str).strip() == '' or date_str == '0001-02-16' or date_str == '0001-03-20':
            return None
        
        try:
            # Try different date formats
            for fmt in ['%Y-%m-%d', '%Y-%m-%d %H:%M:%S', '%m/%d/%Y']:
                try:
                    return datetime.strptime(str(date_str).strip(), fmt)
                except ValueError:
                    continue
            return None
        except:
            return None
    
    def parse_labels_as_tags(self, labels_str: str) -> List[str]:
        """Parse HomeBox labels into Hearth tags"""
        if not labels_str:
            return []
        
        # Split by semicolon and clean up
        tags = [label.strip() for label in str(labels_str).split(';') if label.strip()]
        return tags
    
    def import_item(self, item: Dict, container_id: str) -> bool:
        """Import a single item into Hearth"""
        if not self.db or not self.user_id:
            return False
        
        try:
            # Parse purchase date
            purchase_date = self.parse_date(item.get('HB.purchase_time'))
            
            # Parse purchase price
            purchase_price = None
            try:
                price_str = str(item.get('HB.purchase_price', '')).strip()
                if price_str and price_str != '0' and price_str != '':
                    purchase_price = float(price_str)
            except (ValueError, TypeError):
                pass
            
            # Parse sold price (as current value)
            current_value = None
            try:
                sold_price_str = str(item.get('HB.sold_price', '')).strip()
                if sold_price_str and sold_price_str != '0' and sold_price_str != '':
                    current_value = float(sold_price_str)
            except (ValueError, TypeError):
                pass
            
            # Create item data
            item_data = {
                'name': str(item.get('HB.name', 'Unnamed Item')).strip(),
                'description': str(item.get('HB.description', '')).strip() or None,
                'containerId': container_id,
                'userId': self.user_id,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP,
                
                # Metadata
                'purchasePrice': purchase_price,
                'currentValue': current_value,
                'purchaseDate': purchase_date,
                'manufacturer': str(item.get('HB.manufacturer', '')).strip() or None,
                'model': str(item.get('HB.model_number', '')).strip() or None,
                'serialNumber': str(item.get('HB.serial_number', '')).strip() or None,
                'warranty': str(item.get('HB.warranty_details', '')).strip() or None,
                'brand': str(item.get('HB.manufacturer', '')).strip() or None,  # Use manufacturer as brand
                
                # HomeBox specific fields (stored in notes or description)
                'notes': self.build_notes(item),
                
                # Tags from labels
                'tags': self.parse_labels_as_tags(item.get('HB.labels', '')),
                
                # Additional fields
                'imageUrl': None,
                'categoryId': None,
                'condition': None
            }
            
            # Add to Firestore
            doc_ref = self.db.collection('items').add(item_data)
            item_id = doc_ref[1].id
            
            self.items_imported += 1
            if self.items_imported % 10 == 0:
                print(f"📋 Imported {self.items_imported} items...")
            
            return True
            
        except Exception as e:
            error_msg = f"Failed to import item '{item.get('HB.name', 'Unknown')}': {e}"
            print(f"❌ {error_msg}")
            self.errors.append(error_msg)
            return False
    
    def build_notes(self, item: Dict) -> str:
        """Build notes field from HomeBox metadata"""
        notes_parts = []
        
        # Add HomeBox reference
        if item.get('HB.import_ref'):
            notes_parts.append(f"HomeBox ID: {item['HB.import_ref']}")
        
        if item.get('HB.asset_id'):
            notes_parts.append(f"Asset ID: {item['HB.asset_id']}")
        
        # Add original notes
        if item.get('HB.notes'):
            notes_parts.append(f"Notes: {item['HB.notes']}")
        
        # Add purchase info
        if item.get('HB.purchase_from'):
            notes_parts.append(f"Purchased from: {item['HB.purchase_from']}")
        
        # Add warranty info
        warranty_expires = self.parse_date(item.get('HB.warranty_expires'))
        if warranty_expires:
            notes_parts.append(f"Warranty expires: {warranty_expires.strftime('%Y-%m-%d')}")
        
        # Add sold info if applicable
        if item.get('HB.sold_to'):
            notes_parts.append(f"Sold to: {item['HB.sold_to']}")
            sold_date = self.parse_date(item.get('HB.sold_time'))
            if sold_date:
                notes_parts.append(f"Sold on: {sold_date.strftime('%Y-%m-%d')}")
        
        # Add URL if available
        if item.get('HB.url'):
            notes_parts.append(f"HomeBox URL: {item['HB.url']}")
        
        return '\n'.join(notes_parts) if notes_parts else None
    
    def run_import(self, items: List[Dict]):
        """Run the full import process"""
        if not self.user_id:
            print("❌ User ID is required for import")
            return False
        
        if not self.initialize_firebase():
            return False
        
        analysis = self.analyze_data(items)
        
        print(f"\n🚀 STARTING IMPORT")
        print("=" * 50)
        print(f"Total items: {analysis['total_items']}")
        print(f"Containers to create: {len(analysis['locations'])}")
        print(f"User ID: {self.user_id}")
        
        # Create containers for each location
        for location, location_items in analysis['locations'].items():
            print(f"\n📦 Processing location: {location}")
            
            container_id = self.create_container(location, len(location_items))
            if not container_id:
                print(f"❌ Skipping items in '{location}' due to container creation failure")
                continue
            
            self.containers_created[location] = container_id
            
            # Import items for this container
            print(f"📋 Importing {len(location_items)} items...")
            for item in location_items:
                self.import_item(item, container_id)
        
        # Print summary
        print(f"\n✅ IMPORT COMPLETE")
        print("=" * 50)
        print(f"Containers created: {len(self.containers_created)}")
        print(f"Items imported: {self.items_imported}")
        
        if self.errors:
            print(f"\n⚠️  ERRORS ({len(self.errors)}):")
            for error in self.errors[:10]:  # Show first 10 errors
                print(f"  • {error}")
            if len(self.errors) > 10:
                print(f"  ... and {len(self.errors) - 10} more errors")
        
        return len(self.errors) == 0

def main():
    parser = argparse.ArgumentParser(description='Import HomeBox CSV export to Hearth')
    parser.add_argument('--csv', required=True, help='Path to HomeBox CSV export file')
    parser.add_argument('--preview', action='store_true', help='Preview import without actually importing')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be imported without actually importing (no Firebase required)')
    parser.add_argument('--import', action='store_true', dest='do_import', help='Actually perform the import')
    parser.add_argument('--user-id', help='Hearth user ID to import items for (required for --import)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.csv):
        print(f"❌ CSV file not found: {args.csv}")
        sys.exit(1)
    
    if args.do_import and not args.user_id:
        print("❌ --user-id is required when using --import")
        sys.exit(1)
    
    # Create importer
    importer = HomeBoxImporter(args.csv, args.user_id)
    
    # Load CSV data
    items = importer.load_csv_data()
    if not items:
        print("❌ No items loaded from CSV")
        sys.exit(1)
    
    if args.preview:
        importer.preview_import(items)
    elif args.dry_run:
        # Dry run mode - show what would be imported without Firebase
        print("🔍 DRY RUN MODE - Showing what would be imported")
        print("=" * 50)
        
        analysis = importer.analyze_data(items)
        
        print(f"Total items: {analysis['total_items']}")
        print(f"User ID: {args.user_id}")
        print("⚠️  NO DATA WILL BE WRITTEN - THIS IS A SIMULATION")
        
        for location, location_items in analysis['locations'].items():
            print(f"\n📦 Would create container: '{location}'")
            print(f"📋 Would import {len(location_items)} items:")
            
            for i, item in enumerate(location_items[:5]):  # Show first 5 items
                name = item.get('HB.name', 'Unnamed')
                price = item.get('HB.purchase_price', '0')
                labels = item.get('HB.labels', '')
                
                print(f"  • {name}")
                if price and price != '0':
                    print(f"    Price: ${price}")
                if labels:
                    print(f"    Tags: {labels}")
            
            if len(location_items) > 5:
                print(f"  ... and {len(location_items) - 5} more items")
        
        print(f"\n✅ DRY RUN COMPLETE")
        print("To actually import, use --import flag with Firebase authentication")
    elif args.do_import:
        success = importer.run_import(items)
        sys.exit(0 if success else 1)
    else:
        print("❌ Use --preview, --dry-run, or --import")
        sys.exit(1)

if __name__ == '__main__':
    main()