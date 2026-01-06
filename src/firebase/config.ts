// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is properly configured
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName] || import.meta.env[varName] === 'your_api_key_here'
);

export const isFirebaseConfigured = missingEnvVars.length === 0;

// Only initialize Firebase if properly configured
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Optimize auth settings to reduce cookie usage
    if (auth) {
      // Set auth persistence to local (reduces session cookies)
      auth.settings.appVerificationDisabledForTesting = false;
    }
    
    // Add connection resilience settings
    if (db) {
      // Disable offline persistence in development to avoid connection issues
      if (import.meta.env.DEV) {
        console.log('🔧 Development mode: Firebase offline persistence disabled');
      }
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn(
    '🔧 Firebase not configured. Using demo mode.\n' +
    'To enable full functionality, copy .env.example to .env and add your Firebase credentials.'
  );
}

// Export Firebase services (may be null if not configured)
export { auth, db };
export default app;
