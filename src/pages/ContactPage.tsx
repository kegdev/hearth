import { Container, Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import ProtectedEmail from '../components/ProtectedEmail';
import '../styles/legal.css';

const ContactPage = () => {
  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Header>
              <h1 className="mb-0">Contact & Support</h1>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <strong>We're Here to Help!</strong> Whether you have questions, need technical support, 
                or want to provide feedback, we're committed to providing excellent customer service.
              </Alert>

              <section className="mb-4">
                <h2>📧 Get in Touch</h2>
                <div className="bg-body-secondary p-4 rounded border">
                  <Row>
                    <Col md={6}>
                      <h4>General Support</h4>
                      <div className="mb-2">
                        <strong>Email:</strong>
                      </div>
                      <ProtectedEmail 
                        user="support" 
                        domain="keg.dev" 
                        subject="Hearth Support Request"
                      />
                    </Col>
                    <Col md={6}>
                      <h4>Privacy & Data Protection</h4>
                      <div className="mb-2">
                        <strong>Email:</strong>
                      </div>
                      <ProtectedEmail 
                        user="privacy" 
                        domain="keg.dev" 
                        subject="Privacy Rights Request"
                      />
                    </Col>
                  </Row>
                </div>
              </section>

              <section className="mb-4">
                <h2>🚀 Application Information</h2>
                <Row>
                  <Col md={6}>
                    <Card className="h-100">
                      <Card.Body>
                        <h4>🏠 Hearth</h4>
                        <p>Home Inventory Management</p>
                        <p><strong>Website:</strong> <a href="https://hearth.keg.dev" className="text-decoration-none">hearth.keg.dev</a></p>
                        <p><strong>Version:</strong> 1.3.0</p>
                        <Badge bg="success">Production Ready</Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="h-100">
                      <Card.Body>
                        <h4>🔧 Technical Stack</h4>
                        <ul className="list-unstyled">
                          <li>• React 19.2.1</li>
                          <li>• TypeScript 5.9.3</li>
                          <li>• Firebase 12.6.0</li>
                          <li>• Progressive Web App</li>
                        </ul>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </section>

              <section className="mb-4">
                <h2>❓ Frequently Asked Questions</h2>
                
                <div className="mb-3">
                  <h4>How do I get access to Hearth?</h4>
                  <p>
                    Hearth requires admin approval for new users. Click "Request Access" on the login page, 
                    provide your email and reason for wanting access, and an administrator will review your request.
                  </p>
                </div>

                <div className="mb-3">
                  <h4>Can I share my inventory with family members?</h4>
                  <p>
                    Yes! Hearth includes a comprehensive container sharing system. You can share individual containers 
                    with other approved users and set permissions (view, edit, or admin access).
                  </p>
                </div>

                <div className="mb-3">
                  <h4>Is my data secure?</h4>
                  <p>
                    Absolutely. We use industry-standard security measures including encryption, secure authentication, 
                    and database-level access controls. Read our <a href="/privacy-policy" className="text-decoration-none">Privacy Policy</a> for details.
                  </p>
                </div>

                <div className="mb-3">
                  <h4>Can I use Hearth offline?</h4>
                  <p>
                    Yes! Hearth is a Progressive Web App with intelligent caching. You can view and search your inventory 
                    offline, and changes will sync when you're back online.
                  </p>
                </div>

                <div className="mb-3">
                  <h4>How do I print QR codes for my containers?</h4>
                  <p>
                    Each container has a QR code that you can view and download as a PNG file. 
                    Click the QR code icon on any container to generate and save the code for printing on labels.
                  </p>
                </div>

                <div className="mb-3">
                  <h4>Can I export my inventory data?</h4>
                  <p>
                    Yes, administrators can export inventory data in JSON format through the admin dashboard. 
                    This includes all containers, items, and associated metadata.
                  </p>
                </div>
              </section>

              <section className="mb-4">
                <h2>🐛 Report Issues</h2>
                <p>Found a bug or experiencing technical difficulties? Please include the following information when contacting support:</p>
                <ul>
                  <li><strong>Device:</strong> What device are you using? (iPhone, Android, Desktop)</li>
                  <li><strong>Browser:</strong> Which browser and version?</li>
                  <li><strong>Steps to Reproduce:</strong> What were you doing when the issue occurred?</li>
                  <li><strong>Error Messages:</strong> Any error messages you saw</li>
                  <li><strong>Screenshots:</strong> If applicable, screenshots help us understand the issue</li>
                </ul>
              </section>

              <section className="mb-4">
                <h2>💡 Feature Requests</h2>
                <p>
                  Have an idea for improving Hearth? We'd love to hear it! Send us your feature suggestions:
                </p>
                <div className="ms-3 mb-3">
                  <ProtectedEmail 
                    user="support" 
                    domain="keg.dev" 
                    subject="Hearth Feature Request"
                  />
                </div>
                <ul>
                  <li>Description of the feature you'd like to see</li>
                  <li>How it would help you manage your inventory</li>
                  <li>Any specific use cases or examples</li>
                </ul>
              </section>

              <section className="mb-4">
                <h2>📱 Mobile App</h2>
                <p>
                  Hearth is designed as a Progressive Web App (PWA), which means you can install it on your mobile device 
                  for a native app experience:
                </p>
                <ul>
                  <li><strong>iOS:</strong> Open in Safari, tap the share button, then "Add to Home Screen"</li>
                  <li><strong>Android:</strong> Open in Chrome, tap the menu, then "Add to Home Screen"</li>
                  <li><strong>Desktop:</strong> Look for the install icon in your browser's address bar</li>
                </ul>
              </section>

              <section className="mb-4">
                <h2>🔒 Privacy & Data Rights</h2>
                <p>
                  We take your privacy seriously. If you have questions about how we handle your data or want to exercise 
                  your privacy rights (access, deletion, portability), please contact our Data Protection Officer:
                </p>
                <div className="ms-3 mb-3">
                  <ProtectedEmail 
                    user="privacy" 
                    domain="keg.dev" 
                    subject="Privacy Rights Request"
                  />
                </div>
                <p>
                  For detailed information about our data practices, please review our 
                  <a href="/privacy-policy" className="text-decoration-none"> Privacy Policy</a>.
                </p>
              </section>

              <section className="mb-4">
                <h2>⚖️ Legal</h2>
                <p>
                  By using Hearth, you agree to our <a href="/terms-of-service" className="text-decoration-none">Terms of Service</a> 
                  and <a href="/privacy-policy" className="text-decoration-none">Privacy Policy</a>. 
                  These documents outline your rights and responsibilities when using our service.
                </p>
              </section>

              <hr className="my-4" />

              <Alert variant="success">
                <h4>🎯 Our Commitment</h4>
                <p className="mb-0">
                  We're committed to providing excellent customer service and continuously improving Hearth based on your feedback. 
                  Your success in organizing and managing your home inventory is our top priority!
                </p>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;