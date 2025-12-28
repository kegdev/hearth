#!/usr/bin/env python3
"""
HomeBox Image Import Script

This script downloads images from HomeBox, compresses them to match Hearth's
image processing (max 1024px, 800KB, base64), and updates Hearth items with
intelligent name matching to handle variations.

Usage:
    python homebox_image_importer.py --homebox-url http://YOUR_HOMEBOX_IP:3100 --token YOUR_API_TOKEN --user-id YOUR_USER_ID
"""

import argparse
import requests
import json
import os
import sys
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import hashlib
import mimetypes
import base64
from PIL import Image
import io
import re
from difflib import SequenceMatcher

# Load environment variables
load_dotenv()

class HomeBoxImageImporter:
    def __init__(self, homebox_url: str, api_token: str, user_id: str):
        self.homebox_url = homebox_url.rstrip('/')
        self.api_token = api_token
        self.user_id = user_id
        self.db = None
        self.session = requests.Session()
        
        # Cache for Hearth items to avoid repeated queries
        self.hearth_items_cache = None
        
        # Set up API headers
        self.session.headers.update({
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
        # Statistics
        self.items_processed = 0
        self.images_found = 0
        self.images_imported = 0
        self.name_matches_found = 0
        self.fuzzy_matches_found = 0
        self.no_matches_found = 0
        self.errors = []
    
    def initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            else:
                firebase_admin.initialize_app()
            
            self.db = firestore.client()
            print("✅ Firebase initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            return False
    
    def load_hearth_items_cache(self):
        """Load all Hearth items for the user into cache for fuzzy matching"""
        try:
            items_ref = self.db.collection('items')
            query = items_ref.where('userId', '==', self.user_id)
            docs = query.get()
            
            self.hearth_items_cache = {}
            for doc in docs:
                item_data = doc.to_dict()
                item_name = item_data.get('name', '')
                self.hearth_items_cache[item_name] = {
                    'doc_ref': doc.reference,
                    'data': item_data,
                    'normalized_name': self.normalize_name(item_name)
                }
            
            print(f"📋 Loaded {len(self.hearth_items_cache)} Hearth items into cache")
            return True
            
        except Exception as e:
            print(f"❌ Failed to load Hearth items cache: {e}")
            return False
    
    def normalize_name(self, name: str) -> str:
        """Normalize a name for better matching"""
        if not name:
            return ""
        
        # Convert to lowercase
        normalized = name.lower()
        
        # Remove extra whitespace and trailing spaces
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        
        # Remove common punctuation that might differ
        normalized = re.sub(r'[^\w\s\-&]', '', normalized)
        
        # Normalize common variations
        normalized = normalized.replace(' and ', ' & ')
        normalized = normalized.replace('&', ' & ')
        
        # Remove extra spaces again
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        
        return normalized
    
    def find_matching_hearth_item(self, homebox_name: str) -> Optional[Dict]:
        """Find matching Hearth item using exact match, then fuzzy matching"""
        if not self.hearth_items_cache:
            return None
        
        # Try exact match first
        if homebox_name in self.hearth_items_cache:
            self.name_matches_found += 1
            return self.hearth_items_cache[homebox_name]
        
        # Try exact match with stripped spaces
        stripped_name = homebox_name.strip()
        if stripped_name in self.hearth_items_cache:
            self.name_matches_found += 1
            return self.hearth_items_cache[stripped_name]
        
        # Try fuzzy matching
        normalized_homebox = self.normalize_name(homebox_name)
        best_match = None
        best_score = 0.0
        
        for hearth_name, hearth_item in self.hearth_items_cache.items():
            # Compare normalized names
            score = SequenceMatcher(None, normalized_homebox, hearth_item['normalized_name']).ratio()
            
            if score > best_score and score >= 0.85:  # 85% similarity threshold
                best_score = score
                best_match = hearth_item
        
        if best_match:
            self.fuzzy_matches_found += 1
            print(f"🔍 Fuzzy match found: '{homebox_name}' → '{list(self.hearth_items_cache.keys())[list(self.hearth_items_cache.values()).index(best_match)]}' (score: {best_score:.2f})")
            return best_match
        
        self.no_matches_found += 1
        return None
    
    def compress_image_to_base64(self, image_data: bytes, filename: str) -> Optional[str]:
        """
        Compress image to match Hearth's specifications:
        - Max 1024px width/height
        - Max 800KB file size
        - WebP or JPEG format
        - Base64 data URL
        """
        try:
            # Open image with PIL
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary (for JPEG compatibility)
            if image.mode in ('RGBA', 'LA', 'P'):
                # Create white background for transparent images
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
                image = background
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if needed (maintain aspect ratio)
            max_size = 1024
            if image.width > max_size or image.height > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                print(f"📐 Resized image to {image.width}x{image.height}")
            
            # Try WebP first (better compression)
            formats_to_try = [
                ('WEBP', 'image/webp', 85),
                ('JPEG', 'image/jpeg', 80)
            ]
            
            for format_name, mime_type, quality in formats_to_try:
                # Compress image
                output = io.BytesIO()
                
                if format_name == 'WEBP':
                    try:
                        image.save(output, format=format_name, quality=quality, optimize=True)
                    except Exception:
                        # WebP not supported, skip to JPEG
                        continue
                else:
                    image.save(output, format=format_name, quality=quality, optimize=True)
                
                compressed_data = output.getvalue()
                
                # Check if under 800KB
                size_kb = len(compressed_data) / 1024
                if size_kb <= 800:
                    # Convert to base64 data URL
                    base64_data = base64.b64encode(compressed_data).decode('utf-8')
                    data_url = f"data:{mime_type};base64,{base64_data}"
                    
                    original_size = len(image_data) / 1024
                    print(f"📸 Compressed {filename}: {original_size:.1f}KB → {size_kb:.1f}KB ({format_name})")
                    
                    return data_url
                
                # If still too large, reduce quality
                for reduced_quality in [70, 60, 50]:
                    output = io.BytesIO()
                    if format_name == 'WEBP':
                        try:
                            image.save(output, format=format_name, quality=reduced_quality, optimize=True)
                        except Exception:
                            continue
                    else:
                        image.save(output, format=format_name, quality=reduced_quality, optimize=True)
                    
                    compressed_data = output.getvalue()
                    size_kb = len(compressed_data) / 1024
                    
                    if size_kb <= 800:
                        base64_data = base64.b64encode(compressed_data).decode('utf-8')
                        data_url = f"data:{mime_type};base64,{base64_data}"
                        
                        original_size = len(image_data) / 1024
                        print(f"📸 Compressed {filename}: {original_size:.1f}KB → {size_kb:.1f}KB ({format_name}, Q{reduced_quality})")
                        
                        return data_url
            
            print(f"⚠️  Could not compress {filename} under 800KB")
            return None
            
        except Exception as e:
            print(f"❌ Error compressing image {filename}: {e}")
            return None
    
    def test_homebox_connection(self):
        """Test connection to HomeBox API"""
        try:
            # Test API access
            api_url = urljoin(self.homebox_url, '/api/v1/')
            response = self.session.get(api_url, timeout=10)
            
            print(f"🔍 Testing HomeBox API at: {api_url}")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 404:
                print("✅ API endpoint accessible (404 is expected for root)")
            
            # Test items endpoint
            items_url = urljoin(self.homebox_url, '/api/v1/items')
            items_response = self.session.get(items_url, timeout=10)
            
            if items_response.status_code == 200:
                items_data = items_response.json()
                print(f"✅ Successfully authenticated! Found {len(items_data.get('items', []))} items")
                return True
            elif items_response.status_code == 401:
                print("❌ Authentication failed. Check your API token.")
                return False
            else:
                print(f"⚠️  Unexpected response: {items_response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Connection test failed: {e}")
            return False
    
    def get_homebox_items(self) -> List[Dict]:
        """Get all items from HomeBox API"""
        try:
            items_url = urljoin(self.homebox_url, '/api/v1/items')
            response = self.session.get(items_url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                items = data.get('items', [])
                print(f"📋 Retrieved {len(items)} items from HomeBox")
                return items
            else:
                print(f"❌ Failed to get items: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting items: {e}")
            return []
    
    def download_item_image(self, item_id: str, image_id: str) -> Optional[bytes]:
        """Download image directly using item_id and image_id"""
        try:
            image_url = urljoin(self.homebox_url, f'/api/v1/items/{item_id}/attachments/{image_id}')
            response = self.session.get(image_url, timeout=30)
            
            if response.status_code == 200:
                return response.content
            else:
                print(f"❌ Failed to download image {image_id}: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error downloading image {image_id}: {e}")
            return None
    
    def update_hearth_item_image(self, hearth_item: Dict, base64_data_url: str) -> bool:
        """Update Hearth item with base64 image data using cached item reference"""
        try:
            doc_ref = hearth_item['doc_ref']
            doc_ref.update({'imageUrl': base64_data_url})
            
            item_name = hearth_item['data'].get('name', 'Unknown')
            print(f"✅ Updated '{item_name}' with compressed image")
            return True
            
        except Exception as e:
            print(f"❌ Error updating Hearth item: {e}")
            return False
    
    def process_item_images(self, homebox_item: Dict) -> int:
        """Process all images for a single HomeBox item with intelligent matching"""
        item_id = homebox_item.get('id')
        item_name = homebox_item.get('name', 'Unknown Item')
        image_id = homebox_item.get('imageId')
        
        if not item_id or not image_id:
            return 0
        
        print(f"📸 Processing image for '{item_name}' (imageId: {image_id})")
        
        # Find matching Hearth item using intelligent matching
        hearth_item = self.find_matching_hearth_item(item_name)
        if not hearth_item:
            print(f"⚠️  No matching Hearth item found for '{item_name}'")
            return 0
        
        # Download the image directly using the imageId
        image_data = self.download_item_image(item_id, image_id)
        if not image_data:
            return 0
        
        # Compress to base64 (matching Hearth's format)
        base64_data_url = self.compress_image_to_base64(image_data, f"{item_name}.jpg")
        if not base64_data_url:
            return 0
        
        # Update Hearth item
        if self.update_hearth_item_image(hearth_item, base64_data_url):
            return 1
        
        return 0
    
    def run_import(self):
        """Run the full image import process with intelligent matching"""
        print("🖼️  HomeBox Image Import Starting")
        print("=" * 60)
        
        # Initialize Firebase
        if not self.initialize_firebase():
            return False
        
        # Load Hearth items cache for intelligent matching
        if not self.load_hearth_items_cache():
            return False
        
        # Test HomeBox connection
        if not self.test_homebox_connection():
            return False
        
        # Get all HomeBox items
        homebox_items = self.get_homebox_items()
        if not homebox_items:
            print("❌ No items found in HomeBox")
            return False
        
        # Filter items that have images
        items_with_images = [item for item in homebox_items if item.get('imageId')]
        print(f"📋 Found {len(items_with_images)} items with images out of {len(homebox_items)} total")
        
        # Process each item
        for i, item in enumerate(items_with_images):
            item_name = item.get('name', 'Unknown')
            print(f"\n📋 [{i+1}/{len(items_with_images)}] Processing: {item_name}")
            
            self.items_processed += 1
            
            images_count = self.process_item_images(item)
            if images_count > 0:
                self.images_found += 1
                self.images_imported += images_count
        
        # Print detailed summary
        print(f"\n✅ IMAGE IMPORT COMPLETE")
        print("=" * 60)
        print(f"Items processed: {self.items_processed}")
        print(f"Images found: {self.images_found}")
        print(f"Images imported: {self.images_imported}")
        print(f"Exact name matches: {self.name_matches_found}")
        print(f"Fuzzy matches found: {self.fuzzy_matches_found}")
        print(f"No matches found: {self.no_matches_found}")
        print(f"Format: Base64 data URLs (max 1024px, 800KB)")
        
        if self.errors:
            print(f"\n⚠️  ERRORS:")
            for error in self.errors[:10]:
                print(f"  • {error}")
            if len(self.errors) > 10:
                print(f"  ... and {len(self.errors) - 10} more")
        
        return True

def main():
    parser = argparse.ArgumentParser(description='Import images from HomeBox to Hearth with intelligent name matching')
    parser.add_argument('--homebox-url', required=True, help='HomeBox base URL (e.g., http://YOUR_HOMEBOX_IP:3100)')
    parser.add_argument('--token', required=True, help='HomeBox API token')
    parser.add_argument('--user-id', required=True, help='Hearth user ID')
    parser.add_argument('--test-only', action='store_true', help='Only test connection, don\'t import')
    
    args = parser.parse_args()
    
    # Create importer
    importer = HomeBoxImageImporter(args.homebox_url, args.token, args.user_id)
    
    if args.test_only:
        print("🧪 Testing connection only...")
        if importer.test_homebox_connection():
            print("✅ Connection test successful!")
        else:
            print("❌ Connection test failed!")
        return
    
    # Run full import
    success = importer.run_import()
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()