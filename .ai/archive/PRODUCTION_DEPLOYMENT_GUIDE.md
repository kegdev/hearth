# Production Deployment Guide - Hearth App

## 🎯 **Current Status: 95% Ready for Production**

Your Hearth app has comprehensive testing infrastructure, CI/CD pipeline, and user approval system already implemented. This guide covers the **final steps** to go live at `https://hearth.keg.dev`.

## ✅ **ALREADY COMPLETED**

### **Testing Infrastructure** ✅ **DONE**
- ✅ Jest configuration with comprehensive mocks
- ✅ React Testing Library setup
- ✅ 11 test files covering components, services, and utilities
- ✅ Coverage reporting with quality thresholds
- ✅ All testing dependencies installed

### **CI/CD Pipeline** ✅ **DONE**
- ✅ GitHub Actions workflow configured
- ✅ Automated testing on every push/PR
- ✅ Production build optimization
- ✅ Code splitting and PWA setup
- ✅ Deployment automation to GitHub Pages

### **Security & User Management** ✅ **DONE**
- ✅ User approval system fully implemented
- ✅ Registration request workflow
- ✅ Admin dashboard for approvals
- ✅ Account status management
- ✅ Firestore rules updated locally

## 🚀 **FINAL STEPS TO GO LIVE** (15 minutes total)

### **Step 1: Configure GitHub Repository Secrets** (5 minutes)

In your GitHub repository, go to **Settings → Secrets and variables → Actions**, and add these secrets with your actual Firebase values:

```
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id

# EmailJS Configuration (Optional - for admin email notifications)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

**To find these values:**
1. Go to Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Click on your web app to see the config object
4. Copy each value exactly (without quotes)

### **Step 2: Configure DNS for Custom Domain** (5 minutes)

Point `hearth.keg.dev` to GitHub Pages:

**In your DNS provider (where you manage keg.dev):**
```
Type: CNAME
Name: hearth
Value: yourusername.github.io
TTL: 300 (or default)
```

Replace `yourusername` with your actual GitHub username.

### **Step 3: Configure GitHub Pages** (2 minutes)

1. Go to your repository → **Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages` (will be created automatically by the workflow)
4. **Custom domain:** `hearth.keg.dev`
5. **Enforce HTTPS:** ✅ Check this box

### **Step 4: Update Firebase Auth Domains** (2 minutes)

1. Go to Firebase Console → **Authentication → Settings → Authorized domains**
2. Click **"Add domain"**
3. Enter: `hearth.keg.dev`
4. Click **"Add"**

### **Step 5: Configure Email Notifications (Optional)** (10 minutes)

Set up EmailJS for admin notifications when users request access:

**5.1: Create EmailJS Account**
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/) and sign up (free tier: 100 emails/month)
2. Verify your email address

**5.2: Create Email Service**
1. In EmailJS dashboard → **Email Services** → **Add New Service**
2. Choose your email provider (Gmail recommended)
3. Follow setup instructions for your provider
4. Copy the **Service ID** (e.g., `service_abc123`)

**5.3: Create Email Template**
1. Go to **Email Templates** → **Create New Template**
2. Use this template content:
   ```
   Subject: New Registration Request - Hearth App
   
   Hi {{to_name}},
   
   A new user has requested access to Hearth:
   
   User Details:
   • Email: {{user_email}}
   • Name: {{user_name}}
   • Reason: {{user_reason}}
   • Submitted: {{timestamp}}
   
   To review and approve this request, visit:
   {{admin_dashboard_url}}
   
   Best regards,
   {{from_name}}
   ```
3. Copy the **Template ID** (e.g., `template_xyz789`)

**5.4: Get Public Key**
1. Go to **Account** → **General** in EmailJS dashboard
2. Copy your **Public Key** (e.g., `user_def456`)

**5.5: Add EmailJS Secrets to GitHub**
In your GitHub repository → **Settings → Secrets and variables → Actions**, add:
```
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_def456
```

### **Step 6: Deploy Updated Firestore Rules** (2 minutes)

Your Firestore rules have been updated locally to support the user approval system.

**To deploy them:**
1. Go to Firebase Console → **Firestore Database → Rules**
2. Copy the entire content from your local `firestore.rules` file
3. Paste it in the console editor (replacing existing rules)
4. Click **"Publish"**

The rules include validation for the new registration requests and user profiles collections.

### **Step 7: Trigger Initial Deployment** (1 minute)

```bash
# Commit any final changes and push to trigger deployment
git add .
git commit -m "Ready for production deployment"
git push origin main
```

## 🔍 **Verify Deployment**

### **Monitor the Deployment:**
1. Go to **Actions** tab in your GitHub repository
2. Watch the "Deploy to GitHub Pages" workflow
3. Ensure both "test" and "build-and-deploy" jobs complete successfully
4. Check that the `gh-pages` branch is created

### **Test Production Site:**
1. Wait 5-10 minutes for DNS propagation
2. Visit `https://hearth.keg.dev`
3. Verify the site loads correctly
4. Test the user registration flow:
   - Try to access inventory without login → should redirect to registration request
   - Fill out registration request form
   - Verify form submission works
   - **Check admin email** ([admin_email]) for notification (if EmailJS configured)
5. Test email notifications (if configured):
   - Submit a test registration request
   - Verify admin receives notification email
   - Check that email contains user details and admin dashboard link

### **Test Admin Functions:**
1. Log in with your Firebase account ([admin_email])
2. Verify **🛡️ Admin** link appears in navigation menu
3. Go to `https://hearth.keg.dev/admin` (or click the admin link)
4. Verify you can see and approve registration requests
5. Test the complete approval workflow
6. Confirm approved users can access inventory features

## 🔧 **Troubleshooting Common Issues**

### **GitHub Actions Failing:**
- **Missing Secrets:** Verify all Firebase + EmailJS secrets are added to GitHub
- **Build Errors:** Check the Actions log for specific error messages
- **Test Failures:** Run `npm test` locally to debug

### **Email Notifications Not Working:**
- **Check EmailJS Configuration:** Verify service ID, template ID, and public key are correct
- **Test EmailJS Service:** Use EmailJS dashboard to send test email
- **Check Spam Folder:** Admin notifications might be filtered as spam
- **Verify Template:** Ensure EmailJS template uses correct variable names
- **Console Logs:** Check browser console for EmailJS errors during registration

### **Domain Not Working:**
- **DNS Propagation:** Can take up to 24 hours, but usually 5-10 minutes
- **CNAME Record:** Ensure it points to `yourusername.github.io`
- **GitHub Pages:** Verify custom domain is set in repository settings

### **Firebase Connection Issues:**
- **Auth Domain:** Ensure `hearth.keg.dev` is in Firebase authorized domains
- **Rules Not Deployed:** Copy and paste rules from local file to Firebase Console
- **Environment Variables:** Double-check all secrets match your Firebase config

### **User Approval System Issues:**
- **Registration Requests:** Check Firestore console for `registrationRequests` collection
- **Admin Access:** Verify your Firebase user has access to admin dashboard
- **Rules Validation:** Ensure Firestore rules are published correctly

## 📊 **Post-Deployment Checklist**

After successful deployment, verify:

- [ ] **Homepage loads** at https://hearth.keg.dev
- [ ] **HTTPS certificate** is active (green lock icon)
- [ ] **User registration** form works and submits requests
- [ ] **Admin dashboard** accessible at /admin
- [ ] **Firebase authentication** works (Google Sign-In)
- [ ] **Firestore data** saves and loads correctly
- [ ] **PWA installation** prompt appears on mobile
- [ ] **Dark mode toggle** functions properly
- [ ] **QR code generation** works for items
- [ ] **Image upload** and compression works
- [ ] **Statistics footer** displays correct data

## 🎉 **Success! Your App is Live**

Once all steps are complete, your Hearth app will be:

- 🌐 **Live at https://hearth.keg.dev** with custom domain
- 🔐 **Secure** with user approval system preventing unauthorized access
- 🧪 **Quality-assured** with automated testing on every deployment
- 📱 **PWA-enabled** for mobile installation
- 🚀 **Auto-deploying** on every code change to main branch
- 📊 **Production-ready** with comprehensive error handling

## 🔄 **Ongoing Operations**

### **User Management:**
- **Check admin email** for new registration notifications (if EmailJS configured)
- **Use admin dashboard** at `/admin` or click 🛡️ Admin in navigation
- **Approve legitimate users** promptly via dashboard
- **Monitor for spam or abuse** in registration requests

### **Monitoring:**
- Watch GitHub Actions for deployment failures
- Monitor Firebase usage and quotas
- Check for user feedback and issues

### **Updates:**
- All future code changes automatically deploy when pushed to main
- Tests must pass before deployment (quality gate)
- Rollback by reverting commits if needed

## 🆘 **Need Help?**

If you encounter issues during deployment:

1. **Check GitHub Actions logs** for specific error messages
2. **Verify all secrets** are correctly set in GitHub
3. **Test Firebase connection** locally first
4. **Check DNS propagation** with online DNS checker tools
5. **Review Firebase Console** for auth domain and rules status

The deployment infrastructure is robust and designed to be reliable. Most issues are configuration-related and can be resolved by double-checking the settings above.

**Estimated time to production: 15 minutes** ⏰

Your Hearth app is ready to serve users securely at https://hearth.keg.dev! 🏠✨