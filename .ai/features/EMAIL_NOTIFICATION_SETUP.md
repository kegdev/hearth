# Email Notification Setup Guide - Hearth App

## 📧 Overview

The Hearth app now includes email notifications for admin users when new registration requests are submitted. This uses EmailJS to send emails directly from the client-side without requiring a backend server.

## ✅ What's Already Implemented

### **Email Notification Features:**
- ✅ **Admin notifications** when new users request access
- ✅ **User confirmation emails** when requests are submitted
- ✅ **Automatic email sending** integrated into registration flow
- ✅ **Graceful fallback** - app works without email configuration
- ✅ **Demo mode support** - emails skipped in development

### **Email Content:**
- **Admin Email:** Includes user details, reason, and link to admin dashboard
- **User Email:** Confirmation that request was received and next steps
- **Professional formatting** with clear call-to-action

## 🔧 EmailJS Setup Instructions

### **Step 1: Create EmailJS Account**
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (100 emails/month free tier)
3. Verify your email address

### **Step 2: Create Email Service**
1. In EmailJS dashboard, go to **Email Services**
2. Click **"Add New Service"**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. **Copy the Service ID** (e.g., `service_abc123`)

### **Step 3: Create Email Template**
1. Go to **Email Templates** in EmailJS dashboard
2. Click **"Create New Template"**
3. Use this template content:

**Template for Admin Notifications:**
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

4. **Copy the Template ID** (e.g., `template_xyz789`)

### **Step 4: Get Public Key**
1. Go to **Account** → **General** in EmailJS dashboard
2. Find your **Public Key** (e.g., `user_def456`)
3. Copy this key

### **Step 5: Configure Environment Variables**
Add these to your `.env` file:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_def456
```

### **Step 6: Test Email Notifications**
1. **Restart your development server** after adding environment variables
2. **Create a test user** (not admin) and request access
3. **Check your email** (borskaegel@gmail.com) for the notification
4. **Verify the admin dashboard link** works in the email

## 📋 Email Template Variables

The following variables are automatically populated in emails:

### **Admin Notification Variables:**
- `{{to_email}}` - Admin email (borskaegel@gmail.com)
- `{{to_name}}` - Admin name (Admin)
- `{{user_email}}` - Requesting user's email
- `{{user_name}}` - User's display name
- `{{user_reason}}` - Why they want access
- `{{admin_dashboard_url}}` - Link to /admin page
- `{{timestamp}}` - When request was submitted
- `{{from_name}}` - "Hearth Registration System"

### **User Confirmation Variables:**
- `{{to_email}}` - User's email
- `{{to_name}}` - User's name
- `{{message}}` - Confirmation message
- `{{timestamp}}` - When request was submitted

## 🎯 Production Deployment

### **GitHub Secrets Setup:**
When deploying to production, add these secrets to GitHub:

1. Go to your repository → **Settings → Secrets and variables → Actions**
2. Add these secrets:
   ```
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

### **Update GitHub Actions:**
The deployment workflow already includes environment variable support, so emails will work automatically in production once secrets are configured.

## 🔍 Troubleshooting

### **Emails Not Sending:**
1. **Check console logs** for EmailJS errors
2. **Verify environment variables** are set correctly
3. **Check EmailJS dashboard** for usage limits
4. **Test EmailJS service** configuration

### **Template Not Working:**
1. **Verify template ID** matches your EmailJS template
2. **Check template variables** are spelled correctly
3. **Test template** in EmailJS dashboard first

### **Gmail/Outlook Issues:**
1. **Enable 2FA** on your email account
2. **Use app-specific password** instead of regular password
3. **Check spam folder** for test emails

## 📊 Email Notification Flow

### **When User Requests Access:**
```
1. User fills out registration form
2. Request saved to Firestore
3. Admin notification email sent (background)
4. User confirmation email sent (background)
5. User sees success message
6. Admin receives email with approval link
```

### **Email Delivery:**
- **Immediate** - Emails sent as soon as request is submitted
- **Non-blocking** - Email failures don't prevent registration
- **Reliable** - Uses EmailJS's delivery infrastructure
- **Free tier** - 100 emails/month included

## 🎉 Benefits

### **For Admins:**
- **Instant notifications** when new users request access
- **Direct link** to admin dashboard for quick approval
- **User context** included in email for informed decisions

### **For Users:**
- **Confirmation** that their request was received
- **Clear expectations** about the approval process
- **Professional experience** with automated communications

### **For System:**
- **No backend required** - works with static hosting
- **Scalable** - handles multiple requests efficiently
- **Reliable** - professional email delivery service

The email notification system is now ready to use! Configure EmailJS with your credentials and you'll receive notifications for all new registration requests. 📧✨