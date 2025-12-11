import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { compressAndConvertToBase64 } from '../utils/imageUtils';
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

export const getContainerItems = async (containerId: string, userId?: string): Promise<Item[]> => {
  // If Firebase is not configured, return empty array (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: No items in container yet');
    return [];
  }

  try {
    // Include userId in query for security rules
    const q = userId 
      ? query(
          collection(db, COLLECTION_NAME),
          where('containerId', '==', containerId),
          where('userId', '==', userId)
        )
      : query(
          collection(db, COLLECTION_NAME),
          where('containerId', '==', containerId)
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
    console.error('Error fetching container items:', error);
    // Only throw for actual network/permission errors
    throw new Error('Unable to load items from this container. Please check your connection.');
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
    
    // Debug: Log the data being sent to Firestore
    console.log('🔍 Updating item with data:', updateData);
    console.log('🔍 Item ID:', itemId);
    
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