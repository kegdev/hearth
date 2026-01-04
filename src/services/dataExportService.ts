import { 
  collection, 
  getDocs, 
  query, 
  where,
  writeBatch,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import type { Container, Item, Tag, Category } from '../types';

export interface ExportData {
  exportInfo: {
    exportedAt: string;
    exportedBy: string;
    version: string;
    totalContainers: number;
    totalItems: number;
    totalTags: number;
    totalCategories: number;
  };
  containers: Container[];
  items: Item[];
  tags: Tag[];
  categories: Category[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: {
    containers: number;
    items: number;
    tags: number;
    categories: number;
  };
  errors: string[];
}

class DataExportService {
  /**
   * Export all data for a specific user or all users (admin only)
   */
  async exportUserData(userId?: string): Promise<ExportData> {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    try {
      // For now, if no userId is provided, we'll need to get all users' data
      // This requires the updated Firestore rules to be deployed
      // As a temporary workaround, we can export the current user's data
      
      // Get containers
      const containersQuery = userId 
        ? query(collection(db, 'containers'), where('userId', '==', userId))
        : collection(db, 'containers'); // This will fail without updated rules
      const containersSnapshot = await getDocs(containersQuery);
      const containers: Container[] = containersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Container));

      // Get items
      const itemsQuery = userId 
        ? query(collection(db, 'items'), where('userId', '==', userId))
        : collection(db, 'items'); // This will fail without updated rules
      const itemsSnapshot = await getDocs(itemsQuery);
      const items: Item[] = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        purchaseDate: doc.data().purchaseDate?.toDate() || undefined
      } as Item));

      // Get tags
      const tagsQuery = userId 
        ? query(collection(db, 'tags'), where('userId', '==', userId))
        : collection(db, 'tags'); // This will fail without updated rules
      const tagsSnapshot = await getDocs(tagsQuery);
      const tags: Tag[] = tagsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Tag));

      // Get categories
      const categoriesQuery = userId 
        ? query(collection(db, 'categories'), where('userId', '==', userId))
        : collection(db, 'categories'); // This will fail without updated rules
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categories: Category[] = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Category));

      const exportData: ExportData = {
        exportInfo: {
          exportedAt: new Date().toISOString(),
          exportedBy: userId || 'admin',
          version: '1.0',
          totalContainers: containers.length,
          totalItems: items.length,
          totalTags: tags.length,
          totalCategories: categories.length
        },
        containers,
        items,
        tags,
        categories
      };

      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      // Provide more specific error message
      if (error instanceof Error && error.message.includes('permissions')) {
        throw new Error('Export failed: Admin permissions required. Please deploy updated Firestore rules first.');
      }
      throw new Error('Failed to export data');
    }
  }

  /**
   * Download export data as JSON file
   */
  downloadExportData(exportData: ExportData, filename?: string): void {
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `hearth-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Import data from JSON export
   */
  async importData(importData: ExportData, targetUserId: string): Promise<ImportResult> {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    const result: ImportResult = {
      success: false,
      message: '',
      imported: {
        containers: 0,
        items: 0,
        tags: 0,
        categories: 0
      },
      errors: []
    };

    try {
      // Validate import data structure
      if (!importData.exportInfo || !importData.containers || !importData.items) {
        throw new Error('Invalid import data format');
      }

      const batch = writeBatch(db);
      const now = new Date();

      // Import tags first (items reference them)
      for (const tag of importData.tags || []) {
        const tagRef = doc(collection(db, 'tags'));
        const tagData = {
          ...tag,
          id: tagRef.id, // Generate new ID
          userId: targetUserId, // Assign to target user
          createdAt: Timestamp.fromDate(new Date(tag.createdAt)),
          updatedAt: Timestamp.fromDate(now)
        };
        batch.set(tagRef, tagData);
        result.imported.tags++;
      }

      // Import categories
      for (const category of importData.categories || []) {
        const categoryRef = doc(collection(db, 'categories'));
        const categoryData = {
          ...category,
          id: categoryRef.id, // Generate new ID
          userId: targetUserId,
          createdAt: Timestamp.fromDate(new Date(category.createdAt)),
          updatedAt: Timestamp.fromDate(now)
        };
        batch.set(categoryRef, categoryData);
        result.imported.categories++;
      }

      // Import containers
      const containerIdMap = new Map<string, string>(); // old ID -> new ID
      for (const container of importData.containers) {
        const containerRef = doc(collection(db, 'containers'));
        containerIdMap.set(container.id, containerRef.id);
        
        const containerData = {
          ...container,
          id: containerRef.id, // Generate new ID
          userId: targetUserId,
          createdAt: Timestamp.fromDate(new Date(container.createdAt)),
          updatedAt: Timestamp.fromDate(now)
        };
        batch.set(containerRef, containerData);
        result.imported.containers++;
      }

      // Import items (update container references)
      for (const item of importData.items) {
        const itemRef = doc(collection(db, 'items'));
        const newContainerId = containerIdMap.get(item.containerId);
        
        if (!newContainerId) {
          result.errors.push(`Item "${item.name}" references unknown container ID: ${item.containerId}`);
          continue;
        }

        const itemData = {
          ...item,
          id: itemRef.id, // Generate new ID
          containerId: newContainerId, // Update container reference
          userId: targetUserId,
          createdAt: Timestamp.fromDate(new Date(item.createdAt)),
          updatedAt: Timestamp.fromDate(now),
          purchaseDate: item.purchaseDate ? Timestamp.fromDate(new Date(item.purchaseDate)) : undefined
        };
        batch.set(itemRef, itemData);
        result.imported.items++;
      }

      // Execute batch write
      await batch.commit();

      result.success = true;
      result.message = `Successfully imported ${result.imported.containers} containers, ${result.imported.items} items, ${result.imported.tags} tags, and ${result.imported.categories} categories`;

    } catch (error) {
      console.error('Error importing data:', error);
      result.success = false;
      result.message = error instanceof Error ? error.message : 'Unknown import error';
      result.errors.push(result.message);
    }

    return result;
  }

  /**
   * Validate import file format
   */
  validateImportData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.exportInfo) {
      errors.push('Missing export information');
    }

    if (!Array.isArray(data.containers)) {
      errors.push('Invalid or missing containers array');
    }

    if (!Array.isArray(data.items)) {
      errors.push('Invalid or missing items array');
    }

    if (data.tags && !Array.isArray(data.tags)) {
      errors.push('Invalid tags array');
    }

    if (data.categories && !Array.isArray(data.categories)) {
      errors.push('Invalid categories array');
    }

    // Validate required fields in containers
    if (data.containers) {
      data.containers.forEach((container: any, index: number) => {
        if (!container.name || !container.userId) {
          errors.push(`Container at index ${index} missing required fields (name, userId)`);
        }
      });
    }

    // Validate required fields in items
    if (data.items) {
      data.items.forEach((item: any, index: number) => {
        if (!item.name || !item.containerId || !item.userId) {
          errors.push(`Item at index ${index} missing required fields (name, containerId, userId)`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const dataExportService = new DataExportService();