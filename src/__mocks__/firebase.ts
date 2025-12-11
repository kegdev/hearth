// Firebase mock for testing
export const initializeApp = jest.fn();

export const getAuth = jest.fn(() => ({
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
}));

export const getFirestore = jest.fn(() => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
}));

export const GoogleAuthProvider = jest.fn();

// Firestore functions
export const collection = jest.fn();
export const doc = jest.fn();
export const addDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();
export const getDocs = jest.fn();
export const getDoc = jest.fn();
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const onSnapshot = jest.fn();
export const serverTimestamp = jest.fn(() => new Date());

// Auth functions
export const onAuthStateChanged = jest.fn();
export const signInWithPopup = jest.fn();
export const signOut = jest.fn();