import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface ShortUrl {
  id: string;           // Short code
  originalUrl: string;  // Full path to redirect to
  createdAt: Date;
  createdBy: string;    // User ID
  type: 'container' | 'item';
  entityId: string;     // Container or item ID for cleanup
}

class ShortUrlService {
  private collectionName = 'shortUrls';

  /**
   * Generate a short, URL-safe code
   */
  private generateShortCode(): string {
    // Use base36 for URL-safe characters (0-9, a-z)
    // 6 characters gives us 36^6 = ~2 billion combinations
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create a short URL for a container or item
   */
  async createShortUrl(
    originalUrl: string,
    userId: string,
    type: 'container' | 'item',
    entityId: string
  ): Promise<string> {
    let shortCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    // Generate unique short code (handle collisions)
    do {
      shortCode = this.generateShortCode();
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new Error('Unable to generate unique short code');
      }
      
      // Check if code already exists
      const existingDoc = await getDoc(doc(db, this.collectionName, shortCode));
      if (!existingDoc.exists()) {
        break;
      }
    } while (true);

    // Create short URL record
    const shortUrl: ShortUrl = {
      id: shortCode,
      originalUrl,
      createdAt: new Date(),
      createdBy: userId,
      type,
      entityId
    };

    await setDoc(doc(db, this.collectionName, shortCode), shortUrl);
    return shortCode;
  }

  /**
   * Get original URL from short code
   */
  async getOriginalUrl(shortCode: string): Promise<string | null> {
    try {
      const docRef = doc(db, this.collectionName, shortCode);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as ShortUrl;
        return data.originalUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting original URL:', error);
      return null;
    }
  }

  /**
   * Get existing short URL for an entity (to avoid duplicates)
   */
  async getExistingShortUrl(
    originalUrl: string,
    userId: string
  ): Promise<string | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('originalUrl', '==', originalUrl),
        where('createdBy', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().id;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting existing short URL:', error);
      return null;
    }
  }

  /**
   * Get or create short URL (reuse existing if available)
   */
  async getOrCreateShortUrl(
    originalUrl: string,
    userId: string,
    type: 'container' | 'item',
    entityId: string
  ): Promise<string> {
    // Check if short URL already exists for this path and user
    const existing = await this.getExistingShortUrl(originalUrl, userId);
    if (existing) {
      return existing;
    }

    // Create new short URL
    return await this.createShortUrl(originalUrl, userId, type, entityId);
  }

  /**
   * Clean up short URLs when container is deleted
   */
  async cleanupContainerShortUrls(containerId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Find all short URLs for this container
      const q = query(
        collection(db, this.collectionName),
        where('type', '==', 'container'),
        where('entityId', '==', containerId)
      );
      
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error cleaning up container short URLs:', error);
    }
  }

  /**
   * Clean up short URLs when item is deleted
   */
  async cleanupItemShortUrls(itemId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Find all short URLs for this item
      const q = query(
        collection(db, this.collectionName),
        where('type', '==', 'item'),
        where('entityId', '==', itemId)
      );
      
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error cleaning up item short URLs:', error);
    }
  }

  /**
   * Clean up all short URLs for a user (when user is deleted)
   */
  async cleanupUserShortUrls(userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      const q = query(
        collection(db, this.collectionName),
        where('createdBy', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error cleaning up user short URLs:', error);
    }
  }
}

export const shortUrlService = new ShortUrlService();