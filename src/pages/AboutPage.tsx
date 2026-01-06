import { Container, Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import '../styles/legal.css';

const AboutPage = () => {
  return (
    <Container className="py-4">
      <Row>
        <Col lg={10} className="mx-auto">
          <Card>
            <Card.Header>
              <h1 className="mb-0">About Hearth</h1>
            </Card.Header>
            <Card.Body>
              <Alert variant="primary">
                <h4>🏠 Never lose track of your belongings again!</h4>
                <p className="mb-0">
                  Hearth is a modern home inventory management system designed to help you catalog, organize, 
                  and track all your personal belongings with ease and precision.
                </p>
              </Alert>

              <section className="mb-4">
                <h2>✨ What is Hearth?</h2>
                <p>
                  Hearth is a comprehensive Progressive Web Application (PWA) that transforms how you manage your home inventory. 
                  Whether you're organizing for insurance purposes, moving to a new home, or simply want to know what you own and where it is, 
                  Hearth provides the tools you need.
                </p>
                <p>
                  Built with modern web technologies and designed with a mobile-first approach, Hearth works seamlessly across 
                  all your devices and even functions offline when you need it most.
                </p>
              </section>

              <section className="mb-4">
                <h2>🎯 Key Features</h2>
                <Row>
                  <Col md={6}>
                    <Card className="mb-3 h-100">
                      <Card.Body>
                        <h4>📦 Smart Organization</h4>
                        <ul>
                          <li>Create containers for rooms, boxes, and storage areas</li>
                          <li>Add detailed item records with photos and descriptions</li>
                          <li>Flexible tagging and categorization system</li>
                          <li>Track purchase prices and current values</li>
                        </ul>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-3 h-100">
                      <Card.Body>
                        <h4>🤝 Collaboration</h4>
                        <ul>
                          <li>Share containers with family and household members</li>
                          <li>Granular permissions (view, edit, admin)</li>
                          <li>Real-time collaboration and updates</li>
                          <li>Secure user approval system</li>
                        </ul>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-3 h-100">
                      <Card.Body>
                        <h4>📱 QR Code Integration</h4>
                        <ul>
                          <li>Generate QR codes for physical containers</li>
                          <li>Print labels for easy identification</li>
                          <li>Quick access to container contents</li>
                          <li>Bridge physical and digital organization</li>
                        </ul>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-3 h-100">
                      <Card.Body>
                        <h4>🔍 Powerful Search</h4>
                        <ul>
                          <li>Global search across all your inventory</li>
                          <li>Real-time search suggestions</li>
                          <li>Search by name, brand, model, location</li>
                          <li>Find items in shared containers</li>
                        </ul>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </section>

              <section className="mb-4">
                <h2>🚀 Technology & Performance</h2>
                <Row>
                  <Col md={8}>
                    <h3>Built with Modern Technology</h3>
                    <p>
                      Hearth is built using cutting-edge web technologies to ensure fast performance, 
                      reliability, and an excellent user experience:
                    </p>
                    <ul>
                      <li><strong>React 19.2.1</strong> - Latest React with concurrent features</li>
                      <li><strong>TypeScript 5.9.3</strong> - Full type safety and developer experience</li>
                      <li><strong>Firebase 12.6.0</strong> - Secure, scalable backend infrastructure</li>
                      <li><strong>Progressive Web App</strong> - Native app experience in your browser</li>
                      <li><strong>Responsive Design</strong> - Optimized for mobile, tablet, and desktop</li>
                    </ul>
                  </Col>
                  <Col md={4}>
                    <Card className="bg-body-secondary border">
                      <Card.Body>
                        <h4 className="text-body">Performance Metrics</h4>
                        <div className="mb-2">
                          <Badge bg="success">Performance: 92/100</Badge>
                        </div>
                        <div className="mb-2">
                          <Badge bg="success">Accessibility: 95/100</Badge>
                        </div>
                        <div className="mb-2">
                          <Badge bg="success">Best Practices: 96/100</Badge>
                        </div>
                        <div className="mb-2">
                          <Badge bg="success">PWA: 100/100</Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </section>

              <section className="mb-4">
                <h2>🔒 Security & Privacy</h2>
                <p>Your data security and privacy are our top priorities:</p>
                <Row>
                  <Col md={6}>
                    <h4>🛡️ Security Measures</h4>
                    <ul>
                      <li>End-to-end encryption for all data</li>
                      <li>Secure Google OAuth authentication</li>
                      <li>Database-level access controls</li>
                      <li>Regular security updates and monitoring</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h4>🔐 Privacy Protection</h4>
                    <ul>
                      <li>GDPR compliant data handling</li>
                      <li>User-controlled data sharing</li>
                      <li>Right to data portability and deletion</li>
                      <li>Transparent privacy practices</li>
                    </ul>
                  </Col>
                </Row>
              </section>

              <section className="mb-4">
                <h2>📱 Progressive Web App Benefits</h2>
                <p>Hearth is designed as a PWA, giving you the best of both web and native app experiences:</p>
                <Row>
                  <Col md={4}>
                    <Card className="text-center mb-3">
                      <Card.Body>
                        <h4>📶 Offline Access</h4>
                        <p>View and search your inventory even without internet connection</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="text-center mb-3">
                      <Card.Body>
                        <h4>⚡ Fast Loading</h4>
                        <p>Intelligent caching for instant access to your data</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="text-center mb-3">
                      <Card.Body>
                        <h4>📲 Install Anywhere</h4>
                        <p>Add to home screen on any device for native app experience</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </section>

              <section className="mb-4">
                <h2>🎯 Perfect For</h2>
                <Row>
                  <Col md={6}>
                    <h4>🏠 Homeowners</h4>
                    <ul>
                      <li>Insurance documentation and claims</li>
                      <li>Moving and relocation planning</li>
                      <li>Estate planning and asset tracking</li>
                      <li>Warranty and maintenance tracking</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h4>👨‍👩‍👧‍👦 Families</h4>
                    <ul>
                      <li>Shared household inventory management</li>
                      <li>Teaching kids organization skills</li>
                      <li>Coordinating family belongings</li>
                      <li>Gift and purchase planning</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h4>📦 Collectors</h4>
                    <ul>
                      <li>Detailed cataloging of collections</li>
                      <li>Value tracking and appreciation</li>
                      <li>Condition monitoring</li>
                      <li>Sharing collections with others</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h4>🏢 Small Businesses</h4>
                    <ul>
                      <li>Equipment and asset tracking</li>
                      <li>Inventory management</li>
                      <li>Depreciation and tax documentation</li>
                      <li>Team access and collaboration</li>
                    </ul>
                  </Col>
                </Row>
              </section>

              <section className="mb-4">
                <h2>🌟 Why Choose Hearth?</h2>
                <Alert variant="success">
                  <Row>
                    <Col md={6}>
                      <h4>✅ User-Focused Design</h4>
                      <ul className="mb-0">
                        <li>Intuitive, mobile-first interface</li>
                        <li>Accessibility compliant (WCAG AA)</li>
                        <li>Dark and light theme support</li>
                        <li>Responsive across all devices</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <h4>🚀 Continuous Innovation</h4>
                      <ul className="mb-0">
                        <li>Regular feature updates</li>
                        <li>Performance optimizations</li>
                        <li>User feedback integration</li>
                        <li>Modern technology stack</li>
                      </ul>
                    </Col>
                  </Row>
                </Alert>
              </section>

              <section className="mb-4">
                <h2>📈 Version History</h2>
                <div className="timeline">
                  <div className="mb-3">
                    <Badge bg="primary">v1.3.0</Badge> <strong>Current Version</strong>
                    <ul>
                      <li>Comprehensive legal compliance pages (Terms, Privacy, Contact, About)</li>
                      <li>Image optimization system for performance improvement</li>
                      <li>Admin tool for compressing existing large images</li>
                      <li>Professional legal navigation and styling</li>
                    </ul>
                  </div>
                  <div className="mb-3">
                    <Badge bg="secondary">v1.2.0</Badge> <strong>Global Search & Container Sharing</strong>
                    <ul>
                      <li>Global search system with real-time suggestions</li>
                      <li>Container sharing with granular permissions</li>
                      <li>Performance optimizations for large inventories</li>
                      <li>Enhanced mobile experience</li>
                    </ul>
                  </div>
                  <div className="mb-3">
                    <Badge bg="secondary">v1.1.0</Badge> <strong>Container Sharing Release</strong>
                    <ul>
                      <li>Multi-user collaboration system</li>
                      <li>User approval workflow</li>
                      <li>Enhanced security and permissions</li>
                    </ul>
                  </div>
                  <div className="mb-3">
                    <Badge bg="secondary">v1.0.0</Badge> <strong>Initial Release</strong>
                    <ul>
                      <li>Core inventory management</li>
                      <li>QR code generation</li>
                      <li>PWA functionality</li>
                      <li>Mobile-responsive design</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-4">
                <h2>🤝 Get Started</h2>
                <p>
                  Ready to take control of your home inventory? Getting started with Hearth is easy:
                </p>
                <ol>
                  <li><strong>Request Access:</strong> Click "Request Access" and provide your email and reason for wanting to use Hearth</li>
                  <li><strong>Wait for Approval:</strong> An administrator will review and approve your request</li>
                  <li><strong>Start Organizing:</strong> Create your first container and begin cataloging your belongings</li>
                  <li><strong>Share & Collaborate:</strong> Invite family members and share containers as needed</li>
                </ol>
              </section>

              <hr className="my-4" />

              <Alert variant="info">
                <Row>
                  <Col md={8}>
                    <h4>💬 Questions or Feedback?</h4>
                    <p className="mb-0">
                      We'd love to hear from you! Whether you have questions, suggestions, or just want to share 
                      how Hearth has helped you organize your home, please don't hesitate to reach out.
                    </p>
                  </Col>
                  <Col md={4} className="text-end">
                    <a href="/contact" className="btn btn-primary">Contact Us</a>
                  </Col>
                </Row>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;