import { Container, Card, Alert } from 'react-bootstrap';
import '../styles/legal.css';

const PrivacyPolicyPage = () => {
  return (
    <Container className="py-4">
      <Card>
        <Card.Header>
          <h1 className="mb-0">Privacy Policy</h1>
        </Card.Header>
        <Card.Body>
          <div className="legal-content">
            <p className="text-muted mb-4">
              <strong>Last Updated:</strong> January 3, 2026
            </p>

            <Alert variant="info">
              <strong>Your Privacy Matters:</strong> This Privacy Policy explains how Hearth collects, uses, and protects your personal information. 
              We are committed to transparency and giving you control over your data.
            </Alert>

            <section className="mb-4">
              <h2>1. Information We Collect</h2>
              
              <h3>1.1 Account Information</h3>
              <p>When you register for Hearth, we collect:</p>
              <ul>
                <li><strong>Google Account Information:</strong> Name, email address, and profile picture from your Google account</li>
                <li><strong>Registration Details:</strong> Reason for requesting access and any additional information you provide</li>
                <li><strong>User Preferences:</strong> Theme settings and application preferences</li>
              </ul>

              <h3>1.2 Inventory Data</h3>
              <p>As you use Hearth, we store:</p>
              <ul>
                <li><strong>Container Information:</strong> Names, descriptions, locations, and images of your containers</li>
                <li><strong>Item Details:</strong> Names, descriptions, photos, purchase prices, current values, brands, models, serial numbers, and other metadata</li>
                <li><strong>Tags and Categories:</strong> Custom tags and categories you create for organization</li>
                <li><strong>Sharing Data:</strong> Information about containers you share with other users and permissions granted</li>
              </ul>

              <h3>1.3 Usage Information</h3>
              <p>We automatically collect:</p>
              <ul>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and operating system</li>
                <li><strong>Usage Analytics:</strong> How you interact with the application, features used, and performance metrics</li>
                <li><strong>Error Logs:</strong> Technical errors and application crashes for debugging purposes</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2>2. How We Use Your Information</h2>
              
              <h3>2.1 Service Provision</h3>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and maintain the Hearth inventory management service</li>
                <li>Process your registration and manage your account</li>
                <li>Enable container sharing and collaboration features</li>
                <li>Generate QR codes and manage your inventory data</li>
                <li>Provide customer support and respond to your inquiries</li>
              </ul>

              <h3>2.2 Service Improvement</h3>
              <p>We analyze usage data to:</p>
              <ul>
                <li>Improve application performance and user experience</li>
                <li>Develop new features and functionality</li>
                <li>Fix bugs and resolve technical issues</li>
                <li>Understand how users interact with the application</li>
              </ul>

              <h3>2.3 Communication</h3>
              <p>We may use your email address to:</p>
              <ul>
                <li>Send important service announcements and updates</li>
                <li>Notify administrators of new user registration requests</li>
                <li>Provide technical support and customer service</li>
                <li>Send security alerts about your account</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2>3. Information Sharing and Disclosure</h2>
              
              <h3>3.1 User-Controlled Sharing</h3>
              <p>
                When you share containers with other Hearth users, the shared users can access the container and item information 
                based on the permissions you grant (view, edit, or admin). You control all sharing decisions.
              </p>

              <h3>3.2 Service Providers</h3>
              <p>We share information with trusted service providers who help us operate Hearth:</p>
              <ul>
                <li><strong>Firebase (Google):</strong> Database, authentication, and hosting services</li>
                <li><strong>EmailJS:</strong> Email notification services for admin communications</li>
                <li><strong>GitHub:</strong> Code hosting and deployment services</li>
              </ul>

              <h3>3.3 Legal Requirements</h3>
              <p>We may disclose your information if required by law or to:</p>
              <ul>
                <li>Comply with legal processes or government requests</li>
                <li>Protect our rights, property, or safety</li>
                <li>Protect the rights, property, or safety of our users</li>
                <li>Investigate potential violations of our Terms of Service</li>
              </ul>

              <h3>3.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. 
                We will notify you of any such change in ownership or control of your personal information.
              </p>
            </section>

            <section className="mb-4">
              <h2>4. Data Security</h2>
              <p>We implement comprehensive security measures to protect your information:</p>
              
              <h3>4.1 Technical Security</h3>
              <ul>
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard encryption</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can access your data</li>
                <li><strong>Authentication:</strong> Secure Google OAuth authentication with session management</li>
                <li><strong>Firestore Rules:</strong> Database-level security rules enforce proper access permissions</li>
                <li><strong>Regular Updates:</strong> We regularly update our security measures and monitor for threats</li>
              </ul>

              <h3>4.2 Web Application Security</h3>
              <ul>
                <li><strong>Content Security Policy (CSP):</strong> Prevents cross-site scripting (XSS) attacks</li>
                <li><strong>Permissions Policy:</strong> Restricts access to unnecessary browser APIs and device features</li>
                <li><strong>Security Headers:</strong> Comprehensive HTTP security headers protect against common attacks</li>
                <li><strong>Frame Protection:</strong> Prevents the application from being embedded in malicious frames</li>
                <li><strong>MIME Protection:</strong> Prevents content type confusion attacks</li>
              </ul>

              <p>
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-4">
              <h2>5. Your Rights and Choices</h2>
              
              <h3>5.1 Access and Control</h3>
              <p>You have the right to:</p>
              <ul>
                <li><strong>Access:</strong> View all personal information we have about you</li>
                <li><strong>Update:</strong> Modify your account information and inventory data at any time</li>
                <li><strong>Delete:</strong> Remove specific items, containers, or your entire account</li>
                <li><strong>Export:</strong> Download your inventory data in a portable format</li>
                <li><strong>Control Sharing:</strong> Manage who has access to your containers and revoke access at any time</li>
              </ul>

              <h3>5.2 GDPR Rights (EU Users)</h3>
              <p>If you are located in the European Union, you have additional rights under GDPR:</p>
              <ul>
                <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we process your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
              </ul>

              <h3>5.3 Exercising Your Rights</h3>
              <p>
                To exercise any of these rights, please contact us at support@keg.dev. 
                We will respond to your request within 30 days and may require verification of your identity.
              </p>
            </section>

            <section className="mb-4">
              <h2>6. Data Retention</h2>
              <p>We retain your information for as long as necessary to provide the service and fulfill our legal obligations:</p>
              <ul>
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Inventory Data:</strong> Retained until you delete items/containers or close your account</li>
                <li><strong>Usage Logs:</strong> Retained for up to 2 years for security and improvement purposes</li>
                <li><strong>Deleted Data:</strong> Permanently deleted within 30 days of deletion request</li>
              </ul>
              <p>
                When you delete your account, we will delete your personal information and inventory data, 
                except where we are required to retain it for legal or regulatory purposes.
              </p>
            </section>

            <section className="mb-4">
              <h2>7. International Data Transfers</h2>
              <p>
                Hearth uses Firebase (Google Cloud) for data storage and processing. Your data may be transferred to and processed in 
                countries other than your own, including the United States. We ensure that such transfers comply with applicable 
                data protection laws and that appropriate safeguards are in place.
              </p>
            </section>

            <section className="mb-4">
              <h2>8. Children's Privacy</h2>
              <p>
                Hearth is not intended for use by children under the age of 13. We do not knowingly collect personal information 
                from children under 13. If we become aware that we have collected personal information from a child under 13, 
                we will take steps to delete such information promptly.
              </p>
            </section>

            <section className="mb-4">
              <h2>9. Cookies and Tracking</h2>
              <p>Hearth uses the following types of data storage and tracking:</p>
              
              <h3>9.1 Essential Cookies</h3>
              <ul>
                <li><strong>Authentication Tokens:</strong> Secure tokens for maintaining your login session</li>
                <li><strong>Session Storage:</strong> Temporary storage for session validation and performance optimization</li>
                <li><strong>Local Storage:</strong> Stores user preferences (theme settings) and cached data for offline functionality</li>
              </ul>

              <h3>9.2 Third-Party Cookies</h3>
              <p>We use trusted third-party services that may set their own cookies:</p>
              <ul>
                <li><strong>Google Firebase:</strong> Authentication and database services (Google's privacy policy applies)</li>
                <li><strong>Google OAuth:</strong> Secure login functionality (limited to essential authentication scopes)</li>
              </ul>
              
              <h3>9.3 Cookie Control</h3>
              <p>
                You can control cookies through your browser settings. However, disabling essential cookies may affect 
                the functionality of Hearth, particularly login and data synchronization features.
              </p>
              
              <Alert variant="info" className="mt-3">
                <strong>Cookie Minimization:</strong> We've configured our services to use the minimum necessary cookies 
                for functionality. We do not use cookies for advertising or non-essential tracking.
              </Alert>
            </section>

            <section className="mb-4">
              <h2>10. Google API Services and User Data</h2>
              <p>
                Hearth uses Google API Services for authentication and complies with the 
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                  Google API Services User Data Policy
                </a>, including the Limited Use requirements.
              </p>

              <h3>10.1 Google User Data Accessed</h3>
              <p>Hearth accesses the following Google user data through Google OAuth:</p>
              <ul>
                <li><strong>Basic Profile Information:</strong> Your name, email address, and profile picture</li>
                <li><strong>Email Address:</strong> Used for account identification and communication</li>
                <li><strong>Authentication Token:</strong> Secure token to verify your identity</li>
              </ul>
              <p>
                <strong>Scopes Used:</strong> We only request the minimum necessary scopes:
              </p>
              <ul>
                <li><code>openid</code> - Basic authentication</li>
                <li><code>email</code> - Access to your email address</li>
                <li><code>profile</code> - Access to your basic profile information</li>
              </ul>

              <h3>10.2 How We Use Google User Data</h3>
              <p>Google user data is used exclusively for the following purposes:</p>
              <ul>
                <li><strong>Account Creation and Management:</strong> Creating and maintaining your Hearth account</li>
                <li><strong>Authentication:</strong> Verifying your identity when you log in</li>
                <li><strong>User Identification:</strong> Displaying your name and profile picture in the application</li>
                <li><strong>Communication:</strong> Sending account-related notifications and support responses</li>
                <li><strong>Admin Approval Process:</strong> Identifying users during the registration approval process</li>
              </ul>
              <p>
                <strong>We do NOT use Google user data for:</strong>
              </p>
              <ul>
                <li>Advertising or marketing purposes</li>
                <li>Training AI or machine learning models</li>
                <li>Selling or sharing with third parties for commercial purposes</li>
                <li>Any purpose other than providing the Hearth inventory management service</li>
              </ul>

              <h3>10.3 Google User Data Sharing</h3>
              <p>
                <strong>We do NOT share your Google user data with third parties</strong> except in the following limited circumstances:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> Only with Google Firebase (part of Google Cloud) for secure data storage and authentication</li>
                <li><strong>Legal Requirements:</strong> Only if required by law or to protect our legal rights</li>
                <li><strong>User Consent:</strong> Only with your explicit consent for specific purposes</li>
              </ul>
              <p>
                Your Google user data is never sold, used for advertising, or shared for commercial purposes.
              </p>

              <h3>10.4 Google User Data Storage and Protection</h3>
              <p>Google user data is protected through multiple security layers:</p>
              <ul>
                <li><strong>Encryption:</strong> All data encrypted in transit (HTTPS) and at rest using Google Cloud encryption</li>
                <li><strong>Access Controls:</strong> Strict database rules limit access to authorized users only</li>
                <li><strong>Secure Infrastructure:</strong> Hosted on Google Firebase with enterprise-grade security</li>
                <li><strong>Authentication Security:</strong> OAuth tokens are securely managed and regularly refreshed</li>
                <li><strong>Data Minimization:</strong> We only store the minimum necessary Google user data</li>
              </ul>

              <h3>10.5 Google User Data Retention and Deletion</h3>
              <p>We retain Google user data according to the following policies:</p>
              <ul>
                <li><strong>Active Accounts:</strong> Google user data is retained while your account is active</li>
                <li><strong>Account Deletion:</strong> When you delete your account, all Google user data is permanently deleted within 30 days</li>
                <li><strong>Data Portability:</strong> You can request a copy of your data at any time</li>
                <li><strong>User Control:</strong> You can update your profile information or disconnect Google authentication at any time</li>
              </ul>
              
              <h3>10.6 User Rights for Google Data</h3>
              <p>You have full control over your Google user data:</p>
              <ul>
                <li><strong>Access:</strong> View all Google data we have stored about you</li>
                <li><strong>Update:</strong> Modify your profile information through your account settings</li>
                <li><strong>Delete:</strong> Request deletion of your Google user data by deleting your account</li>
                <li><strong>Revoke Access:</strong> Disconnect Google authentication through your Google Account settings</li>
                <li><strong>Data Export:</strong> Request a copy of your data in a portable format</li>
              </ul>
              
              <Alert variant="info" className="mt-3">
                <strong>Google API Services Compliance:</strong> Hearth's use of information received from Google APIs 
                adheres to the Google API Services User Data Policy, including the Limited Use requirements. 
                We are committed to transparent and responsible use of your Google account information.
              </Alert>
            </section>

            <section className="mb-4">
              <h2>11. Other Third-Party Services</h2>
              <p>In addition to Google services, Hearth integrates with:</p>
              <ul>
                <li><strong>EmailJS:</strong> Email notification service for admin communications (EmailJS Privacy Policy applies)</li>
              </ul>
              <p>
                These services have their own privacy policies, and we encourage you to review them to understand 
                how they handle your information.
              </p>
            </section>

            <section className="mb-4">
              <h2>11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. 
                We will notify you of any material changes by:
              </p>
              <ul>
                <li>Posting the updated policy on this page with a new "Last Updated" date</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a prominent notice in the application</li>
              </ul>
              <p>
                Your continued use of Hearth after the changes take effect constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-4">
              <h2>12. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-body-secondary p-3 rounded border">
                <p className="mb-2"><strong>Email:</strong> support@keg.dev</p>
                <p className="mb-2"><strong>Website:</strong> <a href="https://hearth.keg.dev" className="text-decoration-none">https://hearth.keg.dev</a></p>
                <p className="mb-0"><strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 30 days</p>
              </div>
            </section>

            <section className="mb-4">
              <h2>13. Data Protection Officer</h2>
              <p>
                For GDPR-related inquiries or to exercise your rights under GDPR, you may contact our Data Protection Officer at:
              </p>
              <p><strong>Email:</strong> privacy@keg.dev</p>
            </section>

            <hr className="my-4" />
            
            <Alert variant="success">
              <strong>Transparency Commitment:</strong> We believe in being transparent about our data practices. 
              This Privacy Policy is written in plain language to help you understand exactly how we handle your information. 
              If anything is unclear, please don't hesitate to contact us.
            </Alert>

            <p className="text-muted small">
              This Privacy Policy is effective as of January 3, 2026. By using Hearth, you acknowledge that you have read, 
              understood, and agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PrivacyPolicyPage;