# GitHub Pages Deployment Guide - Hearth App

## 🚀 Overview

The Hearth inventory app can be deployed to GitHub Pages since it's a client-side React app that connects to Firebase. This guide covers deployment to `https://hearth.keg.dev`.

## 📋 Prerequisites

- GitHub repository pushed to GitHub
- Custom domain `hearth.keg.dev` configured with your DNS provider
- Firebase project configured and rules deployed

## 🔧 Step 1: Configure Vite for GitHub Pages

Update `vite.config.ts` to set the correct base path:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      manifest: {
        name: 'Hearth - Home Inventory',
        short_name: 'Hearth',
        description: 'Organize your home inventory with ease',
        theme_color: '#0d6efd',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      // Disable in development to avoid the error
      disable: mode === 'development'
    })
  ],
  // Set base to '/' for custom domain
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          bootstrap: ['bootstrap', 'react-bootstrap']
        }
      }
    }
  }
}))
```

## 🏗️ Step 2: Add GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        cname: hearth.keg.dev
```

## 🔐 Step 3: Configure GitHub Secrets

In your GitHub repository, go to Settings → Secrets and variables → Actions, and add these secrets:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🌐 Step 4: Configure Custom Domain

### DNS Configuration
Point your domain to GitHub Pages:

```
Type: CNAME
Name: hearth
Value: yourusername.github.io
```

Or if using apex domain:
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

### GitHub Pages Settings
1. Go to your repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` (created by the action)
4. Custom domain: `hearth.keg.dev`
5. Enforce HTTPS: ✅ Enabled

## 📱 Step 5: Update Firebase Configuration

### Add Domain to Firebase Auth
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add: `hearth.keg.dev`

### Update Firestore Security Rules
Ensure your rules allow the production domain (they should already be configured correctly).

## 🚀 Step 6: Deploy

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

2. **Monitor Deployment:**
   - Go to Actions tab in GitHub
   - Watch the deployment workflow
   - Check for any errors

3. **Verify:**
   - Visit `https://hearth.keg.dev`
   - Test login functionality
   - Verify Firebase connection

## 🔧 Troubleshooting

### Common Issues:

**404 on Refresh:**
Add `public/_redirects` file:
```
/*    /index.html   200
```

**Firebase Auth Domain Error:**
Ensure `hearth.keg.dev` is added to Firebase Auth authorized domains.

**Build Failures:**
Check that all environment variables are set in GitHub Secrets.

**DNS Propagation:**
DNS changes can take up to 24 hours to propagate globally.

## 📊 Performance Optimizations

The app is already optimized with:
- ✅ Code splitting
- ✅ PWA support
- ✅ Image compression
- ✅ Bundle optimization
- ✅ Lazy loading

## 🔄 Automatic Deployments

Once configured, every push to `main` branch will:
1. Build the app with production environment variables
2. Deploy to GitHub Pages
3. Update `https://hearth.keg.dev` automatically

## 📝 Notes

- **Free Hosting:** GitHub Pages is free for public repositories
- **HTTPS:** Automatically provided by GitHub Pages
- **CDN:** Global CDN included
- **Custom Domain:** Fully supported with SSL
- **No Server Required:** Pure client-side deployment

Your Hearth app will be live at `https://hearth.keg.dev` with automatic deployments! 🎉