import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { compressAndConvertToBase64 } from '../utils/imageUtils';
import type { Container, CreateContainerData } from '../types';

const COLLECTION_NAME = 'containers';

export const createContainer = async (
  userId: string,
  data: CreateContainerData
): Promise<Container> => {
  // If Firebase is not configured, return mock container (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📦 Demo mode: Container created locally');
    let imageUrl: string | undefined;

    // Still process image in demo mode for UI testing
    if (data.image) {
      imageUrl = await compressAndConvertToBase64(data.image);
    }

    const now = new Date();
    return {
      id: `demo_${Date.now()}`,
      name: data.name,
      description: data.description,
      location: data.location,
      imageUrl,
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
    const containerData = {
      name: data.name,
      description: data.description || null,
      location: data.location || null,
      imageUrl: imageUrl || null,
      userId,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), containerData);
    
    return {
      id: docRef.id,
      name: data.name,
      description: data.description,
      location: data.location,
      imageUrl,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating container:', error);
    throw new Error('Failed to create container');
  }
};

export const getUserContainers = async (userId: string): Promise<Container[]> => {
  // If Firebase is not configured, return empty array (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📦 Demo mode: No containers yet');
    return [];
  }

  try {
    // Try without orderBy first to see if that's the issue
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Return empty array if no containers found (not an error)
    const containers = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        location: data.location,
        imageUrl: data.imageUrl,
        userId: data.userId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
    
    // Sort by createdAt in JavaScript instead of Firestore
    containers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return containers;
  } catch (error) {
    console.error('Error fetching containers:', error);
    // Only throw for actual network/permission errors
    throw new Error('Unable to connect to your inventory. Please check your internet connection.');
  }
};

export const updateContainer = async (
  containerId: string,
  data: Partial<CreateContainerData>
): Promise<void> => {
  // If Firebase is not configured, just return (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📦 Demo mode: Container updated locally');
    return;
  }

  try {
    const containerRef = doc(db, COLLECTION_NAME, containerId);
    
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
    if (data.location !== undefined) updateData.location = data.location || null;
    
    await updateDoc(containerRef, updateData);
  } catch (error) {
    console.error('Error updating container:', error);
    throw new Error('Failed to update container');
  }
};

export const deleteContainer = async (containerId: string, userId?: string): Promise<void> => {
  // If Firebase is not configured, just return (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📦 Demo mode: Container deleted locally');
    return;
  }

  try {
    // Use batch to delete container and all its items atomically
    const batch = writeBatch(db);
    
    // Delete the container
    const containerRef = doc(db, COLLECTION_NAME, containerId);
    batch.delete(containerRef);
    
    // Find and delete all items in this container
    const itemsQuery = userId 
      ? query(
          collection(db, 'items'),
          where('containerId', '==', containerId),
          where('userId', '==', userId)
        )
      : query(
          collection(db, 'items'),
          where('containerId', '==', containerId)
        );
    
    const itemsSnapshot = await getDocs(itemsQuery);
    
    // Add each item deletion to the batch
    itemsSnapshot.docs.forEach((itemDoc) => {
      batch.delete(itemDoc.ref);
    });
    
    // Execute all deletions atomically
    await batch.commit();
    
    console.log(`Container ${containerId} and ${itemsSnapshot.docs.length} items deleted`);
  } catch (error) {
    console.error('Error deleting container:', error);
    throw new Error('Failed to delete container');
  }
};