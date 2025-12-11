# Production Deployment Guide

## 🚀 Quick Deploy Checklist

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Fill in your Firebase credentials in .env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Firebase Security Rules
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Or manually copy firestore.rules content to Firebase Console
```

### 3. Build and Deploy
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, Firebase Hosting, etc.)
```

## 🔒 Security Configuration

### Firebase Console Setup
1. **Authentication**
   - Enable Google Sign-In
   - Add authorized domains for production
   - Configure OAuth consent screen

2. **Firestore Database**
   - Deploy security rules from `firestore.rules`
   - Verify rules in Firebase Console Rules tab

3. **Project Settings**
   - Add production domain to authorized domains
   - Configure CORS if needed

### Environment Variables
Never commit `.env` files to version control. Set these in your hosting platform:

**Vercel:**
```bash
vercel env add VITE_FIREBASE_API_KEY
# ... add all other variables
```

**Netlify:**
```bash
netlify env:set VITE_FIREBASE_API_KEY your_value
# ... add all other variables
```

## 📊 Monitoring Setup

### Error Tracking (Recommended)
Add to `src/components/ErrorBoundary.tsx`:
```typescript
// Replace TODO comment with:
import * as Sentry from '@sentry/react';
Sentry.captureException(error);
```

### Analytics (Optional)
Add Google Analytics or similar to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🌐 Hosting Platforms

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy --only hosting
```

## 🔧 Performance Optimization

### Build Optimization
```json
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['react-bootstrap', 'bootstrap']
        }
      }
    }
  }
});
```

### CDN Setup
Consider using a CDN for static assets:
- Cloudflare (free tier available)
- AWS CloudFront
- Vercel Edge Network (automatic)

## 📱 PWA Setup (Optional)

### Service Worker
```bash
npm install -D vite-plugin-pwa
```

### Manifest
Add to `public/manifest.json`:
```json
{
  "name": "Hearth - Home Inventory",
  "short_name": "Hearth",
  "description": "Your digital home inventory system",
  "theme_color": "#0d6efd",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🧪 Testing Before Deploy

### Local Production Build
```bash
npm run build
npm run preview
```

### Checklist
- [ ] All environment variables set
- [ ] Firebase rules deployed
- [ ] Google Sign-In works
- [ ] Container creation works
- [ ] Item creation with images works
- [ ] QR codes generate correctly
- [ ] Mobile responsive design
- [ ] Error boundaries catch errors
- [ ] No console errors in production build

## 🚨 Post-Deploy Monitoring

### Health Checks
- Monitor Firebase usage quotas
- Check error rates in hosting platform
- Monitor Core Web Vitals
- Test authentication flow regularly

### Backup Strategy
- Firebase automatically backs up Firestore
- Consider exporting user data periodically
- Document recovery procedures

## 📈 Scaling Considerations

### Current Limits (Free Tiers)
- **Firestore**: 50K reads, 20K writes per day
- **Authentication**: Unlimited
- **Hosting**: 10GB bandwidth per month

### When to Upgrade
- Monitor Firebase usage in console
- Upgrade to Blaze plan when approaching limits
- Consider image optimization service for heavy usage

## 🎯 Success Metrics

Track these KPIs:
- User sign-up rate
- Container creation rate  
- Item creation rate
- QR code generation usage
- Error rates
- Page load times
- Mobile vs desktop usage

Your app is now production-ready! 🎉