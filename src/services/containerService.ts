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
import type { Container, CreateContainerData } from '../types';

const COLLECTION_NAME = 'containers';

export const createContainer = async (
  userId: string,
  data: CreateContainerData
): Promise<Container> => {
  // If Firebase is not configured, return mock container (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📦 Demo mode: Container created locally');
    const now = new Date();
    return {
      id: `demo_${Date.now()}`,
      ...data,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  }

  try {
    const now = new Date();
    const containerData = {
      ...data,
      userId,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), containerData);
    
    return {
      id: docRef.id,
      ...data,
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
    await updateDoc(containerRef, {
      ...data,
      updatedAt: Timestamp.fromDate(new Date()),
    });
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