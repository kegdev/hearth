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
  getDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { getUserProfile } from './userRegistrationService';
import type { 
  ContainerShare, 
  CreateContainerShareData, 
  SharePermission,
  SharedContainer,
  UserProfile
} from '../types';

const CONTAINER_SHARES_COLLECTION = 'containerShares';
const USER_PROFILES_COLLECTION = 'userProfiles';
const CONTAINERS_COLLECTION = 'containers';

/**
 * Share a container with another user
 */
export const shareContainer = async (
  data: CreateContainerShareData,
  currentUserId: string
): Promise<ContainerShare> => {
  // Demo mode handling
  if (!isFirebaseConfigured || !db) {
    console.log('📤 Demo mode: Container share created locally');
    const now = new Date();
    return {
      id: `demo_share_${Date.now()}`,
      containerId: data.containerId,
      ownerId: currentUserId,
      sharedWithId: 'demo_user_456',
      sharedWithEmail: data.targetUserEmail,
      sharedWithName: 'Demo Shared User',
      permission: data.permission,
      sharedAt: now,
      sharedBy: currentUserId,
      createdAt: now,
      updatedAt: now,
    };
  }

  try {
    // 1. Verify the container exists and user owns it
    const containerDoc = await getDoc(doc(db, CONTAINERS_COLLECTION, data.containerId));
    if (!containerDoc.exists()) {
      throw new Error('Container not found or you do not have permission to access it');
    }
    
    const containerData = containerDoc.data();
    if (containerData.userId !== currentUserId) {
      throw new Error('You can only share containers you own');
    }

    // 2. Find the target user by email
    const userQuery = query(
      collection(db, USER_PROFILES_COLLECTION),
      where('email', '==', data.targetUserEmail.toLowerCase().trim())
    );
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      throw new Error('User not found or not approved for the app');
    }

    const targetUser = userSnapshot.docs[0];
    const targetUserData = targetUser.data() as UserProfile;
    
    if (targetUserData.status !== 'approved' && !targetUserData.isAdmin) {
      throw new Error('User is not approved to access the app');
    }

    // 3. Check if share already exists
    const existingShareQuery = query(
      collection(db, CONTAINER_SHARES_COLLECTION),
      where('containerId', '==', data.containerId),
      where('sharedWithId', '==', targetUser.id)
    );
    const existingShareSnapshot = await getDocs(existingShareQuery);
    
    if (!existingShareSnapshot.empty) {
      throw new Error('Container is already shared with this user');
    }

    // 4. Create the share
    const now = new Date();
    
    // Get the owner's profile to include their name
    let ownerProfile;
    try {
      ownerProfile = await getUserProfile(currentUserId);
    } catch (error) {
      console.warn('Could not fetch owner profile for sharing:', error);
      ownerProfile = null;
    }
    
    const shareData = {
      containerId: data.containerId,
      ownerId: currentUserId,
      sharedWithId: targetUser.id,
      sharedWithEmail: targetUserData.email,
      sharedWithName: targetUserData.displayName || null,
      sharedByName: ownerProfile?.displayName || null, // Add owner's name
      permission: data.permission,
      sharedAt: Timestamp.fromDate(now),
      sharedBy: currentUserId,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, CONTAINER_SHARES_COLLECTION), shareData);

    return {
      id: docRef.id,
      containerId: data.containerId,
      ownerId: currentUserId,
      sharedWithId: targetUser.id,
      sharedWithEmail: targetUserData.email,
      sharedWithName: targetUserData.displayName,
      permission: data.permission,
      sharedAt: now,
      sharedBy: currentUserId,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error sharing container:', error);
    throw error;
  }
};

/**
 * Get all shares for a specific container (who it's shared with)
 */
export const getContainerShares = async (
  containerId: string,
  currentUserId: string
): Promise<ContainerShare[]> => {
  // Demo mode handling
  if (!isFirebaseConfigured || !db) {
    console.log('📤 Demo mode: Returning mock container shares');
    return [];
  }

  try {
    // Verify user owns the container first
    const containerDoc = await getDoc(doc(db, CONTAINERS_COLLECTION, containerId));
    if (!containerDoc.exists()) {
      throw new Error('Container not found or you do not have permission to access it');
    }
    
    const containerData = containerDoc.data();
    if (containerData.userId !== currentUserId) {
      throw new Error('You can only view shares for containers you own');
    }

    // Query for shares of this specific container
    const sharesQuery = query(
      collection(db, CONTAINER_SHARES_COLLECTION),
      where('containerId', '==', containerId),
      where('ownerId', '==', currentUserId)
    );
    
    const snapshot = await getDocs(sharesQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        containerId: data.containerId,
        ownerId: data.ownerId,
        sharedWithId: data.sharedWithId,
        sharedWithEmail: data.sharedWithEmail,
        sharedWithName: data.sharedWithName,
        permission: data.permission,
        sharedAt: data.sharedAt.toDate(),
        sharedBy: data.sharedBy,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error) {
    console.error('Error getting container shares:', error);
    throw error;
  }
};

/**
 * Get all containers shared with the current user
 */
export const getSharedContainers = async (userId: string): Promise<SharedContainer[]> => {
  // Demo mode handling
  if (!isFirebaseConfigured || !db) {
    console.log('📤 Demo mode: Returning mock shared containers');
    return [];
  }

  try {
    const sharesQuery = query(
      collection(db, CONTAINER_SHARES_COLLECTION),
      where('sharedWithId', '==', userId)
    );
    
    const sharesSnapshot = await getDocs(sharesQuery);
    
    if (sharesSnapshot.empty) {
      return [];
    }

    // Get all container IDs and fetch container details
    const containerIds = sharesSnapshot.docs.map(doc => doc.data().containerId);
    const containers: SharedContainer[] = [];

    for (const containerId of containerIds) {
      const containerDoc = await getDoc(doc(db, CONTAINERS_COLLECTION, containerId));
      if (containerDoc.exists()) {
        const containerData = containerDoc.data();
        const shareData = sharesSnapshot.docs.find(doc => doc.data().containerId === containerId)?.data();
        
        if (shareData) {
          containers.push({
            id: containerDoc.id,
            name: containerData.name,
            description: containerData.description,
            location: containerData.location,
            imageUrl: containerData.imageUrl,
            userId: containerData.userId,
            createdAt: containerData.createdAt.toDate(),
            updatedAt: containerData.updatedAt.toDate(),
            sharePermission: shareData.permission,
            sharedBy: shareData.ownerId,
            sharedByName: shareData.sharedByName,
            sharedAt: shareData.sharedAt.toDate(),
          });
        }
      }
    }

    return containers;
  } catch (error) {
    console.error('Error getting shared containers:', error);
    throw error;
  }
};

/**
 * Update share permission for a user
 */
export const updateSharePermission = async (
  containerId: string,
  sharedWithId: string,
  newPermission: SharePermission,
  currentUserId: string
): Promise<void> => {
  // Demo mode handling
  if (!isFirebaseConfigured || !db) {
    console.log('📤 Demo mode: Share permission updated locally');
    return;
  }

  try {
    // Verify user owns the container
    const containerDoc = await getDoc(doc(db, CONTAINERS_COLLECTION, containerId));
    if (!containerDoc.exists()) {
      throw new Error('Container not found or you do not have permission to access it');
    }
    
    const containerData = containerDoc.data();
    if (containerData.userId !== currentUserId) {
      throw new Error('You can only modify shares for containers you own');
    }

    // Find the share record
    const shareQuery = query(
      collection(db, CONTAINER_SHARES_COLLECTION),
      where('containerId', '==', containerId),
      where('sharedWithId', '==', sharedWithId)
    );
    
    const shareSnapshot = await getDocs(shareQuery);
    
    if (shareSnapshot.empty) {
      throw new Error('Share not found');
    }

    const shareDoc = shareSnapshot.docs[0];
    await updateDoc(shareDoc.ref, {
      permission: newPermission,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error('Error updating share permission:', error);
    throw error;
  }
};

/**
 * Revoke container share (remove access)
 */
export const revokeContainerShare = async (
  containerId: string,
  sharedWithId: string,
  currentUserId: string
): Promise<void> => {
  // Demo mode handling
  if (!isFirebaseConfigured || !db) {
    console.log('📤 Demo mode: Container share revoked locally');
    return;
  }

  try {
    // Verify user owns the container
    const containerDoc = await getDoc(doc(db, CONTAINERS_COLLECTION, containerId));
    if (!containerDoc.exists()) {
      throw new Error('Container not found or you do not have permission to access it');
    }
    
    const containerData = containerDoc.data();
    if (containerData.userId !== currentUserId) {
      throw new Error('You can only revoke shares for containers you own');
    }

    // Find and delete the share record
    const shareQuery = query(
      collection(db, CONTAINER_SHARES_COLLECTION),
      where('containerId', '==', containerId),
      where('sharedWithId', '==', sharedWithId)
    );
    
    const shareSnapshot = await getDocs(shareQuery);
    
    if (shareSnapshot.empty) {
      throw new Error('Share not found');
    }

    const shareDoc = shareSnapshot.docs[0];
    await deleteDoc(shareDoc.ref);
  } catch (error) {
    console.error('Error revoking container share:', error);
    throw error;
  }
};

/**
 * Check if user has permission to access a container
 */
export const getUserContainerPermission = async (
  containerId: string,
  userId: string
): Promise<SharePermission | null> => {
  // Demo mode handling
  if (!isFirebaseConfigured || !db) {
    console.log('📤 Demo mode: Returning admin permission');
    return 'admin';
  }

  try {
    // First check if user owns the container
    const containerDoc = await getDoc(doc(db, CONTAINERS_COLLECTION, containerId));
    if (!containerDoc.exists()) {
      return null;
    }
    
    const containerData = containerDoc.data();
    if (containerData.userId === userId) {
      return 'admin'; // Owner has admin permission
    }

    // Check if container is shared with user
    const shareQuery = query(
      collection(db, CONTAINER_SHARES_COLLECTION),
      where('containerId', '==', containerId),
      where('sharedWithId', '==', userId)
    );
    
    const shareSnapshot = await getDocs(shareQuery);
    
    if (shareSnapshot.empty) {
      return null; // No access
    }

    const shareData = shareSnapshot.docs[0].data();
    return shareData.permission;
  } catch (error) {
    console.error('Error checking container permission:', error);
    return null;
  }
};

/**
 * Get approved users for sharing (search by email/name)
 */
export const searchApprovedUsers = async (
  searchTerm: string,
  currentUserId: string
): Promise<UserProfile[]> => {
  // Demo mode handling
  if (!isFirebaseConfigured || !db) {
    console.log('📤 Demo mode: Returning mock users');
    return [
      {
        uid: 'demo_user_456',
        email: 'demo2@hearth.app',
        displayName: 'Demo User 2',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }

  try {
    // Query all approved users
    const usersQuery = query(
      collection(db, USER_PROFILES_COLLECTION),
      where('status', '==', 'approved')
    );
    
    const snapshot = await getDocs(usersQuery);
    
    const users = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          status: data.status,
          isAdmin: data.isAdmin,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      })
      .filter(user => {
        return user.uid !== currentUserId && // Exclude current user
          (user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())));
      });

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};