/**
 * Admin Initialization Utility
 * 
 * This script should be run ONCE to create the initial admin profile.
 * After running this, the admin user will have full access without bypasses.
 */

import { initializeAdminProfile } from '../services/userRegistrationService';

/**
 * Initialize admin profile for the specified user
 * Call this function once when the admin user first logs in
 */
export const setupAdminProfile = async (uid: string, email: string, displayName?: string) => {
  try {
    console.log('🔧 Initializing admin profile...');
    
    const adminProfile = await initializeAdminProfile(uid, email, displayName);
    
    console.log('✅ Admin profile created successfully:', {
      uid: adminProfile.uid,
      email: adminProfile.email,
      status: adminProfile.status,
      isAdmin: adminProfile.isAdmin
    });
    
    return adminProfile;
  } catch (error) {
    console.error('❌ Failed to initialize admin profile:', error);
    throw error;
  }
};

/**
 * Check if admin initialization is needed
 */
export const isAdminInitializationNeeded = (email: string): boolean => {
  return email === '[admin_email]';
};