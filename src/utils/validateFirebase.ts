// Firebase configuration validation utility
import { isFirebaseConfigured } from '../firebase/config';

export const validateFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  const validation = {
    isConfigured: isFirebaseConfigured,
    config,
    issues: [] as string[],
    warnings: [] as string[]
  };

  // Check for missing values
  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      validation.issues.push(`Missing ${key}`);
    } else if (value.includes('your_') || value.includes('_here')) {
      validation.issues.push(`${key} contains placeholder value: ${value}`);
    }
  });

  // Check format validity
  if (config.apiKey && !config.apiKey.startsWith('AIza')) {
    validation.warnings.push('API key format may be incorrect (should start with "AIza")');
  }

  if (config.authDomain && !config.authDomain.endsWith('.firebaseapp.com')) {
    validation.warnings.push('Auth domain should end with ".firebaseapp.com"');
  }

  if (config.storageBucket && !config.storageBucket.endsWith('.firebasestorage.app')) {
    validation.warnings.push('Storage bucket should end with ".firebasestorage.app"');
  }

  if (config.messagingSenderId && !/^\d+$/.test(config.messagingSenderId)) {
    validation.warnings.push('Messaging sender ID should be numeric');
  }

  if (config.appId && !config.appId.includes(':web:')) {
    validation.warnings.push('App ID should contain ":web:" for web apps');
  }

  // Check consistency
  if (config.projectId && config.authDomain && !config.authDomain.startsWith(config.projectId)) {
    validation.warnings.push('Project ID and auth domain may not match');
  }

  if (config.projectId && config.storageBucket && !config.storageBucket.startsWith(config.projectId)) {
    validation.warnings.push('Project ID and storage bucket may not match');
  }

  return validation;
};

// Log validation results (development only)
if (import.meta.env.DEV) {
  const validation = validateFirebaseConfig();
  
  if (validation.isConfigured) {
    console.log('✅ Firebase configuration is valid!');
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Firebase warnings:', validation.warnings);
    }
  } else {
    console.log('🔧 Firebase not configured - running in demo mode');
    if (validation.issues.length > 0) {
      console.log('📋 Configuration issues:', validation.issues);
    }
  }
}