import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { compressImage } from '../utils/imageUtils';
import type { Container, Item } from '../types';

export interface OptimizationProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
  errors: string[];
  sizeSaved: number;
}

export interface OptimizationResult {
  success: boolean;
  containersProcessed: number;
  itemsProcessed: number;
  totalSizeBefore: number;
  totalSizeAfter: number;
  sizeSaved: number;
  compressionRatio: number;
  errors: string[];
  timeElapsed: number;
}

class Base64OptimizationService {
  /**
   * Convert base64 data URL to File object
   */
  private base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Convert File to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Aggressively optimize a base64 image
   */
  private async optimizeBase64Image(base64: string): Promise<{
    optimizedUrl: string;
    thumbnailUrl: string;
    originalSize: number;
    optimizedSize: number;
    thumbnailSize: number;
  }> {
    // Convert base64 to file
    const file = this.base64ToFile(base64, 'image.jpg');
    const originalSize = base64.length;

    // Create highly compressed main image (max 80KB)
    const optimizedFile = await compressImage(file, {
      maxSizeMB: 0.08, // 80KB max
      maxWidthOrHeight: 600, // Smaller dimensions
      quality: 0.65 // Balanced quality/size
    });

    // Create tiny thumbnail (max 15KB)
    const thumbnailFile = await compressImage(file, {
      maxSizeMB: 0.015, // 15KB max
      maxWidthOrHeight: 120, // Very small
      quality: 0.6
    });

    // Convert back to base64
    const optimizedUrl = await this.fileToBase64(optimizedFile);
    const thumbnailUrl = await this.fileToBase64(thumbnailFile);

    return {
      optimizedUrl,
      thumbnailUrl,
      originalSize,
      optimizedSize: optimizedUrl.length,
      thumbnailSize: thumbnailUrl.length
    };
  }

  /**
   * Optimize all base64 images for a specific user
   */
  async optimizeUserImages(
    userId: string,
    onProgress?: (progress: OptimizationProgress) => void
  ): Promise<OptimizationResult> {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    const startTime = Date.now();
    const result: OptimizationResult = {
      success: false,
      containersProcessed: 0,
      itemsProcessed: 0,
      totalSizeBefore: 0,
      totalSizeAfter: 0,
      sizeSaved: 0,
      compressionRatio: 0,
      errors: [],
      timeElapsed: 0
    };

    try {
      // Get all containers with base64 images
      const containersQuery = query(
        collection(db, 'containers'),
        where('userId', '==', userId)
      );
      const containersSnapshot = await getDocs(containersQuery);
      const containers = containersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Container))
        .filter(container => 
          container.imageUrl && 
          container.imageUrl.startsWith('data:image/')
        );

      // Get all items with base64 images
      const itemsQuery = query(
        collection(db, 'items'),
        where('userId', '==', userId)
      );
      const itemsSnapshot = await getDocs(itemsQuery);
      const items = itemsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Item))
        .filter(item => 
          item.imageUrl && 
          item.imageUrl.startsWith('data:image/')
        );

      const total = containers.length + items.length;
      let completed = 0;
      let failed = 0;
      let sizeSaved = 0;

      onProgress?.({
        total,
        completed,
        failed,
        current: 'Starting optimization...',
        errors: [],
        sizeSaved: 0
      });

      // Optimize container images
      for (const container of containers) {
        try {
          onProgress?.({
            total,
            completed,
            failed,
            current: `Optimizing container: ${container.name}`,
            errors: result.errors,
            sizeSaved
          });

          const optimization = await this.optimizeBase64Image(container.imageUrl!);
          
          result.totalSizeBefore += optimization.originalSize;
          result.totalSizeAfter += optimization.optimizedSize;
          sizeSaved += (optimization.originalSize - optimization.optimizedSize);

          // Update container with optimized images
          await updateDoc(doc(db, 'containers', container.id), {
            imageUrl: optimization.optimizedUrl,
            thumbnailUrl: optimization.thumbnailUrl,
            updatedAt: new Date()
          });

          completed++;
          result.containersProcessed++;

        } catch (error) {
          failed++;
          const errorMsg = `Failed to optimize container ${container.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg, error);
        }
      }

      // Optimize item images
      for (const item of items) {
        try {
          onProgress?.({
            total,
            completed,
            failed,
            current: `Optimizing item: ${item.name}`,
            errors: result.errors,
            sizeSaved
          });

          const optimization = await this.optimizeBase64Image(item.imageUrl!);
          
          result.totalSizeBefore += optimization.originalSize;
          result.totalSizeAfter += optimization.optimizedSize;
          sizeSaved += (optimization.originalSize - optimization.optimizedSize);

          // Update item with optimized images
          await updateDoc(doc(db, 'items', item.id), {
            imageUrl: optimization.optimizedUrl,
            thumbnailUrl: optimization.thumbnailUrl,
            updatedAt: new Date()
          });

          completed++;
          result.itemsProcessed++;

        } catch (error) {
          failed++;
          const errorMsg = `Failed to optimize item ${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg, error);
        }
      }

      result.success = failed === 0;
      result.sizeSaved = sizeSaved;
      result.compressionRatio = result.totalSizeBefore > 0 ? result.totalSizeBefore / result.totalSizeAfter : 1;
      result.timeElapsed = Date.now() - startTime;

      onProgress?.({
        total,
        completed,
        failed,
        current: 'Optimization complete!',
        errors: result.errors,
        sizeSaved
      });

      return result;

    } catch (error) {
      result.success = false;
      result.timeElapsed = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown optimization error';
      result.errors.push(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Get optimization statistics for a user
   */
  async getOptimizationStats(userId: string): Promise<{
    containersWithLargeImages: number;
    itemsWithLargeImages: number;
    containersWithBase64Images: number;
    itemsWithBase64Images: number;
    totalCurrentSize: number;
    estimatedOptimizedSize: number;
    estimatedSavings: number;
    estimatedCompressionRatio: number;
  }> {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    // Get all user's containers
    const containersQuery = query(
      collection(db, 'containers'),
      where('userId', '==', userId)
    );
    const containersSnapshot = await getDocs(containersQuery);
    const containers = containersSnapshot.docs.map(doc => doc.data() as Container);

    // Get all user's items
    const itemsQuery = query(
      collection(db, 'items'),
      where('userId', '==', userId)
    );
    const itemsSnapshot = await getDocs(itemsQuery);
    const items = itemsSnapshot.docs.map(doc => doc.data() as Item);

    let containersWithLargeImages = 0;
    let itemsWithLargeImages = 0;
    let containersWithBase64Images = 0;
    let itemsWithBase64Images = 0;
    let totalCurrentSize = 0;

    // Analyze containers
    containers.forEach(container => {
      if (container.imageUrl && container.imageUrl.startsWith('data:image/')) {
        const imageSize = container.imageUrl.length;
        totalCurrentSize += imageSize;
        containersWithBase64Images++;
        
        // Consider "large" if over 100KB (base64 encoded) - these will benefit most from optimization
        if (imageSize > 100000) {
          containersWithLargeImages++;
        }
      }
    });

    // Analyze items
    items.forEach(item => {
      if (item.imageUrl && item.imageUrl.startsWith('data:image/')) {
        const imageSize = item.imageUrl.length;
        totalCurrentSize += imageSize;
        itemsWithBase64Images++;
        
        // Consider "large" if over 100KB (base64 encoded) - these will benefit most from optimization
        if (imageSize > 100000) {
          itemsWithLargeImages++;
        }
      }
    });

    // Estimate optimization results (typically 60-80% reduction)
    const estimatedCompressionRatio = 3.5; // Conservative estimate
    const estimatedOptimizedSize = Math.round(totalCurrentSize / estimatedCompressionRatio);
    const estimatedSavings = totalCurrentSize - estimatedOptimizedSize;

    return {
      containersWithLargeImages,
      itemsWithLargeImages,
      containersWithBase64Images,
      itemsWithBase64Images,
      totalCurrentSize,
      estimatedOptimizedSize,
      estimatedSavings,
      estimatedCompressionRatio
    };
  }
}

export const base64OptimizationService = new Base64OptimizationService();