import { Container, Card } from 'react-bootstrap';
import '../styles/legal.css';

const TermsOfServicePage = () => {
  return (
    <Container className="py-4">
      <Card>
        <Card.Header>
          <h1 className="mb-0">Terms of Service</h1>
        </Card.Header>
        <Card.Body>
          <div className="legal-content">
            <p className="text-muted mb-4">
              <strong>Last Updated:</strong> January 3, 2026
            </p>

            <section className="mb-4">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using Hearth ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-4">
              <h2>2. Description of Service</h2>
              <p>
                Hearth is a home inventory management application that allows users to catalog, organize, and track their personal belongings. 
                The Service includes features such as:
              </p>
              <ul>
                <li>Container and item management</li>
                <li>Photo storage and QR code generation</li>
                <li>Sharing containers with other users</li>
                <li>Search and organization tools</li>
                <li>Value tracking and inventory statistics</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2>3. User Registration and Approval</h2>
              <p>
                Access to Hearth requires user registration and admin approval. By requesting access, you agree to:
              </p>
              <ul>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept that access may be granted or denied at our discretion</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2>4. Acceptable Use</h2>
              <p>You agree to use Hearth only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul>
                <li>Upload or share content that is illegal, harmful, or violates others' rights</li>
                <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                <li>Use the Service to store or share copyrighted material without permission</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2>5. User Content and Data</h2>
              <p>
                You retain ownership of all content you upload to Hearth, including photos, descriptions, and inventory data. 
                By using the Service, you grant us a limited license to store, process, and display your content as necessary to provide the Service.
              </p>
              <p>
                You are responsible for:
              </p>
              <ul>
                <li>The accuracy and legality of your content</li>
                <li>Maintaining backups of important data</li>
                <li>Respecting others' privacy when sharing containers</li>
                <li>Complying with applicable laws regarding your inventory data</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2>6. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our 
                <a href="/privacy-policy" className="text-decoration-none"> Privacy Policy</a>, 
                which is incorporated into these Terms by reference.
              </p>
            </section>

            <section className="mb-4">
              <h2>7. Container Sharing</h2>
              <p>
                When you share containers with other users, you agree that:
              </p>
              <ul>
                <li>Shared users may view, edit, or manage your containers based on permissions granted</li>
                <li>You are responsible for managing sharing permissions appropriately</li>
                <li>Shared content remains subject to these Terms of Service</li>
                <li>You may revoke sharing access at any time</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2>8. Service Availability</h2>
              <p>
                We strive to maintain high availability of the Service, but we do not guarantee uninterrupted access. 
                The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
              </p>
            </section>

            <section className="mb-4">
              <h2>9. Limitation of Liability</h2>
              <p>
                Hearth is provided "as is" without warranties of any kind. We shall not be liable for any direct, indirect, 
                incidental, special, or consequential damages resulting from your use of the Service, including but not limited to:
              </p>
              <ul>
                <li>Loss of data or inventory information</li>
                <li>Business interruption or lost profits</li>
                <li>Unauthorized access to your account</li>
                <li>Technical failures or service outages</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2>10. Intellectual Property</h2>
              <p>
                The Hearth application, including its design, functionality, and underlying technology, is protected by intellectual property laws. 
                You may not copy, modify, distribute, or reverse engineer any part of the Service without permission.
              </p>
            </section>

            <section className="mb-4">
              <h2>11. Account Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at any time for violation of these Terms or other reasonable cause. 
                You may also delete your account at any time through the application settings.
              </p>
              <p>
                Upon termination:
              </p>
              <ul>
                <li>Your access to the Service will be immediately revoked</li>
                <li>Your data may be deleted after a reasonable grace period</li>
                <li>Shared containers will be unshared from your account</li>
                <li>These Terms will remain in effect for any outstanding obligations</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2>12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. 
                Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-4">
              <h2>13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where the Service is operated, 
                without regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-4">
              <h2>14. Contact Information</h2>
              <p>
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> support@keg.dev<br />
                <strong>Website:</strong> <a href="https://hearth.keg.dev" className="text-decoration-none">https://hearth.keg.dev</a>
              </p>
            </section>

            <section className="mb-4">
              <h2>15. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated 
                to the minimum extent necessary so that the remaining Terms will remain in full force and effect.
              </p>
            </section>

            <hr className="my-4" />
            
            <p className="text-muted small">
              These Terms of Service are effective as of January 3, 2026. By using Hearth, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms.
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TermsOfServicePage;