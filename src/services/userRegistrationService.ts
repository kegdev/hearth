import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { sendAdminNotification } from './emailNotificationService';
import type { UserRegistrationRequest, CreateRegistrationRequestData, UserProfile } from '../types';

const REGISTRATION_REQUESTS_COLLECTION = 'registrationRequests';
const USER_PROFILES_COLLECTION = 'userProfiles';

/**
 * Submit a registration request
 */
export const submitRegistrationRequest = async (
  data: CreateRegistrationRequestData
): Promise<UserRegistrationRequest> => {
  // If Firebase is not configured, return mock request (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: Registration request created locally');
    const now = new Date();
    return {
      id: `demo_request_${Date.now()}`,
      email: data.email,
      displayName: data.displayName,
      reason: data.reason,
      status: 'pending',
      requestedAt: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  try {
    // Check if request already exists for this email
    const existingRequest = await getRegistrationRequestByEmail(data.email);
    if (existingRequest) {
      throw new Error('A registration request already exists for this email address.');
    }

    const now = new Date();
    const requestData = {
      email: data.email.toLowerCase().trim(),
      displayName: data.displayName?.trim() || null,
      reason: data.reason.trim(),
      uid: data.uid, // Add UID to the request
      status: 'pending' as const,
      requestedAt: Timestamp.fromDate(now),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, REGISTRATION_REQUESTS_COLLECTION), requestData);
    
    const result = {
      id: docRef.id,
      email: data.email,
      displayName: data.displayName,
      reason: data.reason,
      status: 'pending' as const,
      requestedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Send admin notification only
    setTimeout(() => {
      sendAdminNotification(data.email, data.displayName || '', data.reason).catch(console.error);
    }, 100);
    
    return result;
  } catch (error) {
    console.error('Error submitting registration request:', error);
    throw error;
  }
};

/**
 * Get registration request by email
 */
export const getRegistrationRequestByEmail = async (
  email: string
): Promise<UserRegistrationRequest | null> => {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const q = query(
      collection(db, REGISTRATION_REQUESTS_COLLECTION),
      where('email', '==', email.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      email: data.email,
      displayName: data.displayName,
      reason: data.reason,
      status: data.status,
      requestedAt: data.requestedAt.toDate(),
      reviewedAt: data.reviewedAt ? data.reviewedAt.toDate() : undefined,
      reviewedBy: data.reviewedBy,
      reviewNotes: data.reviewNotes,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  } catch (error) {
    console.error('Error getting registration request:', error);
    return null;
  }
};

/**
 * Get all pending registration requests (admin only)
 */
export const getPendingRegistrationRequests = async (): Promise<UserRegistrationRequest[]> => {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    const q = query(
      collection(db, REGISTRATION_REQUESTS_COLLECTION),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    
    const requests = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        reason: data.reason,
        status: data.status,
        requestedAt: data.requestedAt.toDate(),
        reviewedAt: data.reviewedAt ? data.reviewedAt.toDate() : undefined,
        reviewedBy: data.reviewedBy,
        reviewNotes: data.reviewNotes,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });

    // Sort by requestedAt in JavaScript (newest first)
    return requests.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  } catch (error) {
    console.error('Error getting pending requests:', error);
    return [];
  }
};

/**
 * Approve a registration request (admin only)
 */
export const approveRegistrationRequest = async (
  requestId: string,
  adminUserId: string,
  notes?: string
): Promise<void> => {
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: Registration request approved locally');
    return;
  }

  try {
    const now = new Date();
    
    // First, get the registration request to extract user details
    const requestRef = doc(db, REGISTRATION_REQUESTS_COLLECTION, requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Registration request not found');
    }
    
    const requestData = requestDoc.data();
    
    // Create user profile in userProfiles collection using the UID from the request
    const profileData = {
      uid: requestData.uid,
      email: requestData.email.toLowerCase().trim(),
      displayName: requestData.displayName || null,
      status: 'approved' as const,
      isAdmin: false,
      approvedAt: Timestamp.fromDate(now),
      approvedBy: adminUserId,
      approvedNotes: notes || null,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };
    
    // Create profile document using the user's UID as the document ID
    await setDoc(doc(db, USER_PROFILES_COLLECTION, requestData.uid), profileData);
    
    // Delete the registration request after successful approval
    await deleteDoc(requestRef);
    
    console.log(`✅ Approved registration and created profile for: ${requestData.email}`);
    console.log(`🗑️ Deleted registration request: ${requestId}`);
  } catch (error) {
    console.error('Error approving registration request:', error);
    throw new Error('Failed to approve registration request');
  }
};

/**
 * Deny and delete a registration request (admin only)
 * Note: We delete denied requests to prevent resubmission spam
 */
export const denyRegistrationRequest = async (
  requestId: string
): Promise<void> => {
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: Registration request denied and deleted locally');
    return;
  }

  try {
    // Simply delete the request - no need to update status first
    const requestRef = doc(db, REGISTRATION_REQUESTS_COLLECTION, requestId);
    await deleteDoc(requestRef);
    
    console.log(`🗑️ Deleted denied registration request: ${requestId}`);
  } catch (error) {
    console.error('Error deleting denied registration request:', error);
    throw new Error('Failed to deny registration request');
  }
};

/**
 * Create or update user profile
 */
export const createUserProfile = async (
  uid: string,
  email: string,
  displayName?: string,
  status: 'pending' | 'approved' | 'denied' | 'admin' = 'pending'
): Promise<UserProfile> => {
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: User profile created locally');
    const now = new Date();
    return {
      uid,
      email,
      displayName,
      status,
      createdAt: now,
      updatedAt: now,
    };
  }

  try {
    const now = new Date();
    const profileData = {
      uid,
      email: email.toLowerCase().trim(),
      displayName: displayName?.trim() || null,
      status,
      isAdmin: false, // Default to non-admin
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    await addDoc(collection(db, USER_PROFILES_COLLECTION), profileData);
    
    return {
      uid,
      email,
      displayName,
      status,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
};

/**
 * Get user profile by UID
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const q = query(
      collection(db, USER_PROFILES_COLLECTION),
      where('uid', '==', uid)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      status: data.status,
      isAdmin: data.isAdmin || false,
      approvedAt: data.approvedAt ? data.approvedAt.toDate() : undefined,
      approvedBy: data.approvedBy,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Update user profile status
 */
export const updateUserProfileStatus = async (
  uid: string,
  status: 'pending' | 'approved' | 'denied' | 'admin',
  approvedBy?: string
): Promise<void> => {
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: User profile status updated locally');
    return;
  }

  try {
    const q = query(
      collection(db, USER_PROFILES_COLLECTION),
      where('uid', '==', uid)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      const now = new Date();
      
      const updateData: any = {
        status,
        updatedAt: Timestamp.fromDate(now),
      };
      
      if (status === 'approved' || status === 'admin') {
        updateData.approvedAt = Timestamp.fromDate(now);
        updateData.approvedBy = approvedBy;
      }
      
      if (status === 'admin') {
        updateData.isAdmin = true;
      }
      
      await updateDoc(docRef, updateData);
    }
  } catch (error) {
    console.error('Error updating user profile status:', error);
    throw new Error('Failed to update user profile status');
  }
};

/**
 * Initialize admin user profile (run once for setup)
 */
export const initializeAdminProfile = async (
  uid: string,
  email: string,
  displayName?: string
): Promise<UserProfile> => {
  if (!isFirebaseConfigured || !db) {
    console.log('📋 Demo mode: Admin profile created locally');
    const now = new Date();
    return {
      uid,
      email,
      displayName,
      status: 'admin',
      isAdmin: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  try {
    // Check if profile already exists
    const existingProfile = await getUserProfile(uid);
    if (existingProfile) {
      // Update existing profile to admin
      await updateUserProfileStatus(uid, 'admin', 'system');
      return { ...existingProfile, status: 'admin', isAdmin: true };
    }

    // Create new admin profile
    const now = new Date();
    const profileData = {
      uid,
      email: email.toLowerCase().trim(),
      displayName: displayName?.trim() || null,
      status: 'admin' as const,
      isAdmin: true,
      approvedAt: Timestamp.fromDate(now),
      approvedBy: 'system',
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    // Use setDoc with the user's UID as the document ID
    await setDoc(doc(db, USER_PROFILES_COLLECTION, uid), profileData);
    
    return {
      uid,
      email,
      displayName,
      status: 'admin',
      isAdmin: true,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error initializing admin profile:', error);
    throw new Error('Failed to initialize admin profile');
  }
};