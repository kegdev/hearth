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
import { getSharedContainers, getUserContainerPermission } from './containerSharingService';
import { offlineCacheService } from './offlineCacheService';
import { shortUrlService } from './shortUrlService';
import type { Container, CreateContainerData, SharedContainer, ContainerWithSharing } from '../types';

const COLLECTION_NAME = 'containers';

/**
 * Fetch user containers directly from Firestore (internal function)
 */
const fetchUserContainersFromFirestore = async (userId: string): Promise<ContainerWithSharing[]> => {
  // Get owned containers
  const ownedQuery = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );
  
  const ownedSnapshot = await getDocs(ownedQuery);
  
  const ownedContainers: ContainerWithSharing[] = ownedSnapshot.docs.map((doc) => {
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
      isShared: false,
    };
  });

  // Get shared containers - but handle errors gracefully
  let sharedContainers: SharedContainer[] = [];
  try {
    sharedContainers = await getSharedContainers(userId);
  } catch (error) {
    console.warn('Error loading shared containers:', error);
    // Continue with just owned containers if shared containers fail
  }
  
  // Convert shared containers to ContainerWithSharing format
  const sharedAsContainers: ContainerWithSharing[] = sharedContainers.map(shared => ({
    id: shared.id,
    name: shared.name,
    description: shared.description,
    location: shared.location,
    imageUrl: shared.imageUrl,
    userId: shared.userId, // Keep original owner ID
    createdAt: shared.createdAt,
    updatedAt: shared.updatedAt,
    isShared: true,
    sharedByName: shared.sharedByName,
    sharePermission: shared.sharePermission,
  }));
  
  // Combine owned and shared containers
  const allContainers = [...ownedContainers, ...sharedAsContainers];
  
  // Sort by createdAt in JavaScript instead of Firestore
  allContainers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  return allContainers;
};

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
    
    // Clear containers cache since we added a new container
    offlineCacheService.clearContainersCache();
    
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

export const getUserContainers = async (userId: string): Promise<ContainerWithSharing[]> => {
  // If Firebase is not configured, return empty array (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📦 Demo mode: No containers yet');
    return [];
  }

  // Check if we should use cached data for fast loading
  const cachedContainers = offlineCacheService.getCachedContainers(userId);
  
  // If offline, use cache if available
  if (!offlineCacheService.isOnline()) {
    if (cachedContainers) {
      console.log('📦 Using cached containers data (offline)', `- ${cachedContainers.length} containers`);
      return cachedContainers;
    } else {
      throw new Error('No internet connection and no cached containers available');
    }
  }
  
  // If online and we have recent cache (< 2 minutes), use it for speed
  if (cachedContainers && offlineCacheService.isCacheRecentContainers(userId)) {
    console.log('📦 Using recent cached containers (fast load)', `- ${cachedContainers.length} containers`);
    return cachedContainers;
  }

  try {
    // Fetch fresh data from Firestore
    const containers = await fetchUserContainersFromFirestore(userId);
    
    // Cache the results
    offlineCacheService.cacheContainers(userId, containers);
    
    return containers;
  } catch (error) {
    console.error('Error fetching containers:', error);
    
    // Try to use cached data as fallback
    const cachedContainers = offlineCacheService.getCachedContainers(userId);
    if (cachedContainers) {
      console.log('📦 Falling back to cached containers due to error');
      return cachedContainers;
    }
    
    // Only throw for actual network/permission errors
    throw new Error('Unable to connect to your inventory. Please check your internet connection.');
  }
};

export const updateContainer = async (
  containerId: string,
  data: Partial<CreateContainerData>,
  userId?: string
): Promise<void> => {
  // If Firebase is not configured, just return (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📦 Demo mode: Container updated locally');
    return;
  }

  try {
    // Check if user has permission to edit this container
    if (userId) {
      const permission = await getUserContainerPermission(containerId, userId);
      if (!permission || permission === 'view') {
        throw new Error('You do not have permission to edit this container');
      }
    }

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
    
    // Clean up short URLs for this container (async, don't block)
    shortUrlService.cleanupContainerShortUrls(containerId).catch(error => {
      console.warn('Failed to cleanup container short URLs:', error);
    });
    
    console.log(`Container ${containerId} and ${itemsSnapshot.docs.length} items deleted`);
  } catch (error) {
    console.error('Error deleting container:', error);
    throw new Error('Failed to delete container');
  }
};