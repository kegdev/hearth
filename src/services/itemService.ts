import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { compressAndConvertToBase64 } from '../utils/imageUtils';
import { offlineCacheService } from './offlineCacheService';
import type { Item, CreateItemData } from '../types';

const COLLECTION_NAME = 'items';

export const createItem = async (
  userId: string,
  data: CreateItemData
): Promise<Item> => {
  // If Firebase is not configured, return mock item (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: Item created locally');
    let imageUrl: string | undefined;

    // Still process image in demo mode for UI testing
    if (data.image) {
      imageUrl = await compressAndConvertToBase64(data.image);
    }

    const now = new Date();
    return {
      id: `demo_item_${Date.now()}`,
      name: data.name,
      description: data.description,
      containerId: data.containerId,
      imageUrl,
      tags: data.tags || [],
      categoryId: data.categoryId,
      // Advanced properties
      purchasePrice: data.purchasePrice,
      currentValue: data.currentValue,
      purchaseDate: data.purchaseDate,
      condition: data.condition,
      warranty: data.warranty,
      serialNumber: data.serialNumber,
      model: data.model,
      brand: data.brand,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  }

  try {
    let imageUrl: string | undefined;

    // Compress and convert image to base64 if provided
    if (data.image) {
      imageUrl = await compressAndConvertToBase64(data.image);
    }

    const now = new Date();
    const itemData = {
      name: data.name,
      description: data.description,
      containerId: data.containerId,
      imageUrl: imageUrl || null,
      tags: data.tags || [],
      categoryId: data.categoryId || null,
      // Advanced properties
      purchasePrice: data.purchasePrice || null,
      currentValue: data.currentValue || null,
      purchaseDate: data.purchaseDate ? Timestamp.fromDate(data.purchaseDate) : null,
      condition: data.condition || null,
      warranty: data.warranty || null,
      serialNumber: data.serialNumber || null,
      model: data.model || null,
      brand: data.brand || null,
      userId,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), itemData);
    
    // Clear items cache for this container since we added a new item
    offlineCacheService.clearItemsCache(data.containerId);
    
    return {
      id: docRef.id,
      name: data.name,
      description: data.description,
      containerId: data.containerId,
      imageUrl,
      tags: data.tags || [],
      categoryId: data.categoryId,
      // Advanced properties
      purchasePrice: data.purchasePrice,
      currentValue: data.currentValue,
      purchaseDate: data.purchaseDate,
      condition: data.condition,
      warranty: data.warranty,
      serialNumber: data.serialNumber,
      model: data.model,
      brand: data.brand,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating item:', error);
    throw new Error('Failed to create item');
  }
};

export const getUserItems = async (userId: string): Promise<Item[]> => {
  // If Firebase is not configured, return empty array (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: No items yet');
    return [];
  }

  try {
    // Remove orderBy to avoid index requirement
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Return empty array if no items found (not an error)
    const items = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        containerId: data.containerId,
        imageUrl: data.imageUrl,
        tags: data.tags || [],
        categoryId: data.categoryId,
        // Advanced properties
        purchasePrice: data.purchasePrice,
        currentValue: data.currentValue,
        purchaseDate: data.purchaseDate ? data.purchaseDate.toDate() : undefined,
        condition: data.condition,
        warranty: data.warranty,
        serialNumber: data.serialNumber,
        model: data.model,
        brand: data.brand,
        userId: data.userId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
    
    // Sort by createdAt in JavaScript instead
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return items;
  } catch (error) {
    console.error('Error fetching items:', error);
    // Only throw for actual network/permission errors
    throw new Error('Unable to connect to your inventory. Please check your internet connection.');
  }
};

/**
 * Fetch container items directly from Firestore (internal function)
 */
const fetchContainerItemsFromFirestore = async (containerId: string): Promise<Item[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('containerId', '==', containerId)
  );
  
  const querySnapshot = await getDocs(q);
  
  const items = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      containerId: data.containerId,
      imageUrl: data.imageUrl,
      tags: data.tags || [],
      categoryId: data.categoryId,
      // Advanced properties
      purchasePrice: data.purchasePrice,
      currentValue: data.currentValue,
      purchaseDate: data.purchaseDate ? data.purchaseDate.toDate() : undefined,
      condition: data.condition,
      warranty: data.warranty,
      serialNumber: data.serialNumber,
      model: data.model,
      brand: data.brand,
      userId: data.userId,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  });
  
  // Sort by createdAt in JavaScript instead
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  return items;
};

export const getContainerItems = async (containerId: string): Promise<Item[]> => {
  // If Firebase is not configured, return empty array (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: No items in container yet');
    return [];
  }

  // Check if we should use cached data for fast loading
  const cachedItems = offlineCacheService.getCachedItems(containerId);
  
  // If offline, use cache if available
  if (!offlineCacheService.isOnline()) {
    if (cachedItems) {
      console.log(`📋 Using cached items data for container ${containerId} (offline) - ${cachedItems.length} items`);
      return cachedItems;
    } else {
      console.log(`📋 No cached items found for container ${containerId} while offline`);
      throw new Error('No internet connection and no cached items available');
    }
  }
  
  // If online, check if cache is recent
  const isCacheRecent = offlineCacheService.isCacheRecent(containerId, 5);
  console.log(`🔍 Cache check for container ${containerId}: exists=${!!cachedItems}, recent=${isCacheRecent}`);
  
  // Check if cached items have images (if they were stripped due to size)
  const cacheHasImages = cachedItems && cachedItems.some(item => 
    item.imageUrl && !item.imageUrl.includes('[image-cached-separately]') && !item.imageUrl.includes('[cached]')
  );
  
  console.log(`🖼️ Cache image check: hasImages=${cacheHasImages}, sampleImageUrl=${cachedItems?.[0]?.imageUrl?.substring(0, 50)}...`);
  
  // If online and we have recent cache WITH images, use it for speed
  if (cachedItems && isCacheRecent && cacheHasImages) {
    console.log(`📋 Using recent cached items with images for container ${containerId} (fast load) - ${cachedItems.length} items`);
    return cachedItems;
  }
  
  // If we have cache but no images, or cache is stale, fetch fresh data
  if (cachedItems && !cacheHasImages) {
    console.log(`🌐 Fetching fresh items for container ${containerId} (cached items missing images)`);
  } else if (cachedItems && !isCacheRecent) {
    console.log(`🌐 Fetching fresh items for container ${containerId} (cache stale)`);
  } else {
    console.log(`🌐 Fetching fresh items for container ${containerId} (no cache)`);
  }

  try {
    // Fetch fresh data from Firestore
    console.log(`🌐 Fetching fresh items from Firestore for container ${containerId}`);
    const items = await fetchContainerItemsFromFirestore(containerId);
    
    // Cache the results
    console.log(`📋 Caching ${items.length} items for container ${containerId}`);
    offlineCacheService.cacheItems(containerId, items);
    
    console.log(`✅ Successfully loaded ${items.length} items with images`);
    return items;
  } catch (error) {
    console.error('Error fetching container items:', error);
    
    // If it's a connection error, provide more specific messaging
    if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('network'))) {
      console.warn('🌐 Network connection issue detected');
    }
    
    // Try to use cached data as fallback (even though we disabled cache-first)
    const cachedItems = offlineCacheService.getCachedItems(containerId);
    if (cachedItems) {
      console.log('📋 Falling back to cached items due to network error');
      return cachedItems;
    }
    
    // Only throw for actual network/permission errors
    throw new Error('Unable to load items from this container. Please check your connection.');
  }
};

/**
 * Get a specific item by ID (works for owned and shared container items)
 */
export const getItemById = async (itemId: string): Promise<Item | null> => {
  // If Firebase is not configured, return null (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: Item not found');
    return null;
  }

  try {
    const itemDoc = await getDoc(doc(db, COLLECTION_NAME, itemId));
    
    if (!itemDoc.exists()) {
      return null;
    }

    const data = itemDoc.data();
    return {
      id: itemDoc.id,
      name: data.name,
      description: data.description,
      containerId: data.containerId,
      userId: data.userId,
      imageUrl: data.imageUrl,
      tags: data.tags || [],
      categoryId: data.categoryId,
      purchasePrice: data.purchasePrice,
      currentValue: data.currentValue,
      purchaseDate: data.purchaseDate?.toDate(),
      condition: data.condition,
      warranty: data.warranty,
      serialNumber: data.serialNumber,
      model: data.model,
      brand: data.brand,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    };
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    throw new Error('Unable to load item. Please check your connection.');
  }
};

export const updateItem = async (
  itemId: string,
  data: Partial<CreateItemData>
): Promise<void> => {
  // If Firebase is not configured, just return (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📦 Demo mode: Item updated locally');
    return;
  }

  try {
    const itemRef = doc(db, COLLECTION_NAME, itemId);
    
    // Handle image processing if a new image is provided
    let imageUrl: string | null | undefined;
    if (data.image) {
      // Check if it's a removal request
      if (data.image.type === 'image/remove') {
        imageUrl = null; // Remove the image
      } else {
        imageUrl = await compressAndConvertToBase64(data.image);
      }
    }
    
    // Prepare update data with proper type conversions
    // Only include fields that are actually being updated
    const updateData: any = {
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    // Handle image update
    if (data.image !== undefined) {
      updateData.imageUrl = imageUrl !== undefined ? imageUrl : null;
    }
    
    // Copy basic fields only if they're being updated
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.containerId !== undefined) updateData.containerId = data.containerId;
    if (data.tags !== undefined) updateData.tags = data.tags || [];
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
    
    // Handle advanced properties with proper null conversion for empty strings
    if (data.purchasePrice !== undefined) {
      updateData.purchasePrice = data.purchasePrice || null;
    }
    if (data.currentValue !== undefined) {
      updateData.currentValue = data.currentValue || null;
    }
    if (data.purchaseDate !== undefined) {
      updateData.purchaseDate = data.purchaseDate ? Timestamp.fromDate(data.purchaseDate) : null;
    }
    if (data.condition !== undefined) {
      updateData.condition = data.condition || null;
    }
    if (data.warranty !== undefined) {
      updateData.warranty = data.warranty || null;
    }
    if (data.serialNumber !== undefined) {
      updateData.serialNumber = data.serialNumber || null;
    }
    if (data.model !== undefined) {
      updateData.model = data.model || null;
    }
    if (data.brand !== undefined) {
      updateData.brand = data.brand || null;
    }
    
    await updateDoc(itemRef, updateData);
  } catch (error) {
    console.error('Error updating item:', error);
    throw new Error('Failed to update item');
  }
};

export const deleteItem = async (itemId: string): Promise<void> => {
  // If Firebase is not configured, just return (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: Item deleted locally');
    return;
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, itemId));
  } catch (error) {
    console.error('Error deleting item:', error);
    throw new Error('Failed to delete item');
  }
};