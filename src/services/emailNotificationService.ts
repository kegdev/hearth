import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Admin email configuration
const ADMIN_EMAIL = '[admin_email]';
const ADMIN_NAME = 'Admin';

// Prevent duplicate emails within 30 seconds
const recentEmailSends = new Set<string>();

/**
 * Initialize EmailJS (call this once in your app)
 */
export const initializeEmailJS = () => {
  if (EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('📧 EmailJS initialized');
  } else {
    console.log('📧 EmailJS not configured (missing VITE_EMAILJS_PUBLIC_KEY)');
  }
};

/**
 * Send email notification to admin when new registration request is submitted
 */
export const sendAdminNotification = async (
  userEmail: string,
  userName: string,
  reason: string
): Promise<void> => {
  // Skip if EmailJS is not configured (demo mode)
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.log('📧 Demo mode: Email notification skipped (EmailJS not configured)');
    return;
  }

  // Prevent duplicate emails within 60 seconds
  const emailKey = `admin-${userEmail}`;
  if (recentEmailSends.has(emailKey)) {
    console.log('📧 Skipping duplicate admin notification for:', userEmail);
    return;
  }
  recentEmailSends.add(emailKey);
  setTimeout(() => recentEmailSends.delete(emailKey), 60000); // Clean up after 60 seconds

  try {
    const templateParams = {
      to_email: ADMIN_EMAIL,
      to_name: ADMIN_NAME,
      from_name: 'Hearth Registration System',
      subject: 'New Registration Request - Hearth App',
      user_email: userEmail,
      user_name: userName || 'Not provided',
      user_reason: reason,
      admin_dashboard_url: `${window.location.origin}/admin`,
      timestamp: new Date().toLocaleString(),
    };

    console.log('📧 ADMIN EMAIL - Sending with params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ ADMIN EMAIL - Sent successfully:', response);
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
    // Don't throw error - email failure shouldn't block registration
  }
};

/**
 * Send confirmation email to user when their request is submitted
 */
export const sendUserConfirmation = async (
  userEmail: string,
  userName: string
): Promise<void> => {
  // Skip if EmailJS is not configured (demo mode)
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.log('📧 Demo mode: User confirmation email skipped');
    return;
  }

  // Prevent duplicate emails within 60 seconds
  const emailKey = `user-${userEmail}`;
  if (recentEmailSends.has(emailKey)) {
    console.log('📧 Skipping duplicate user confirmation for:', userEmail);
    return;
  }
  recentEmailSends.add(emailKey);
  setTimeout(() => recentEmailSends.delete(emailKey), 60000); // Clean up after 60 seconds

  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName || 'User',
      from_name: 'Hearth Team',
      subject: 'Registration Request Received - Hearth App',
      message: `Hi ${userName || 'there'},

Thank you for your interest in Hearth! We've received your registration request and it's now being reviewed.

What happens next:
• Your request is in our review queue
• An administrator will review your application
• You'll receive an email notification once it's processed

If you have any questions, feel free to contact us at [support_email].

Best regards,
The Hearth Team`,
      timestamp: new Date().toLocaleString(),
    };

    console.log('📧 USER EMAIL - Sending with params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ USER EMAIL - Sent successfully:', response);
  } catch (error) {
    console.error('❌ Failed to send user confirmation:', error);
    // Don't throw error - email failure shouldn't block registration
  }
};

/**
 * Check if email notifications are configured
 */
export const isEmailConfigured = (): boolean => {
  return !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
};