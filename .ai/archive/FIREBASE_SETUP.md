# Firebase Setup Guide for Hearth

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it "Hearth" (or whatever you prefer)
4. Disable Google Analytics (not needed for this app)
5. Click "Create project"

### Step 2: Register Web App
1. In your Firebase project, click the **Web** icon (`</>`)
2. App nickname: "Hearth Web App"
3. **Don't** check "Set up Firebase Hosting" (we'll do that later if needed)
4. Click "Register app"
5. **Copy the config object** - you'll need this in Step 5

### Step 3: Enable Authentication
1. In Firebase Console, go to **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. **Enable Google Sign-In:**
   - Click **Google**
   - Toggle **Enable**
   - Select your project support email
   - Click **Save**
4. **Enable Email/Password (Optional):**
   - Click **Email/Password**
   - Enable the first toggle (Email/Password)
   - Click **Save**

### Step 4: Enable Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll secure it later)
3. Select your preferred location (closest to you)
4. Click **Done**

### Step 5: Image Storage (Choose One Option)

**Option A: Base64 Storage with Auto-Compression (Recommended)**
- Images are automatically compressed to under 1MB and stored as base64 in Firestore
- No additional Firebase setup required - completely free
- Supports all image formats (converted to JPEG for optimal compression)
- Skip Firebase Storage setup - the app handles everything automatically

**Option B: Firebase Storage (Free up to 5GB)**
1. Go to **Storage** → **Get started**
2. Choose **Start in test mode**
3. Select same location as Firestore
4. Click **Done**

**Option C: Alternative Storage Services**
- Cloudinary (free tier: 25GB storage, 25GB bandwidth)
- Supabase Storage (free tier: 1GB storage)
- AWS S3 (free tier: 5GB storage)
- Imgur API (free for personal use)

### Step 6: Update Your Code
Replace the placeholder config in `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

**Where to find these values:**
- Go to Project Settings (gear icon) → General tab
- Scroll down to "Your apps" section
- Click the config icon (`</>`) next to your web app
- Copy the `firebaseConfig` object

## 🧪 Test Your Setup

1. Save the config file
2. Refresh your browser at `http://localhost:5173`
3. Click "Continue with Google" on the login page
4. If successful, you should be redirected to the home page
5. Try creating a container
6. Try adding an item with a photo

## 🎨 Login Page Options

The app includes two login page designs:

**Current: Simple Google-Only Login**
- Clean, minimal design
- One-click Google Sign-In
- Perfect for personal use

**Alternative: Full Login Page**
- Google Sign-In + Email/Password options
- Tabs for Login/Sign Up
- More traditional design

To switch to the full login page, update `src/App.tsx`:
```typescript
// Change this line:
import SimpleLoginPage from './pages/SimpleLoginPage';
// To this:
import LoginPage from './pages/LoginPage';

// And change the route:
<Route path="/login" element={<LoginPage />} />
```

## 🔒 Security Rules (Optional but Recommended)

### Firestore Rules
Go to **Firestore Database** → **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /containers/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /items/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Storage Rules (Only if using Firebase Storage)
Go to **Storage** → **Rules** and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /items/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Note:** If you're using base64 storage (Option A), no storage rules are needed.

## 🎯 What You'll Have

After setup, your app will have:
- ✅ **One-click Google Sign-In** (primary method)
- ✅ Email/password backup authentication
- ✅ Create containers (storage locations)
- ✅ Add items to containers with auto-compressed photos
- ✅ Generate QR codes for containers and items
- ✅ Browse your entire inventory
- ✅ Secure, private data (only you can see your stuff)
- ✅ Smart image compression (any size → under 1MB automatically)

## 🐛 Troubleshooting

**"Firebase: Error (auth/configuration-not-found)"**
- Double-check your config values in `src/firebase/config.ts`
- Make sure Authentication is enabled in Firebase Console

**"Missing or insufficient permissions"**
- Check that Firestore is in test mode OR apply the security rules above
- Make sure you're logged in when trying to create containers/items

**Images not uploading**
- Verify Storage is enabled in Firebase Console
- Check browser console for specific error messages

**Google Sign-In not working**
- Make sure Google authentication is enabled in Firebase Console
- Check that you're using the correct Firebase project
- Try clearing browser cache and cookies

**QR codes not working**
- QR codes will work once Firebase is configured
- They generate URLs like `/container/abc123` that work when scanned

## 🚀 Ready to Rock!

Once configured, your Hearth app is production-ready! You can:
- Print QR code labels for physical containers
- Scan codes to instantly see what's inside
- Keep track of everything you own
- Never lose stuff again! 📦✨