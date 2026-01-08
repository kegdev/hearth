

import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import TagCloud from '../components/TagCloud';

const HomePage = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <Container>
        <Row className="justify-content-center text-center mt-5">
          <Col md={8}>
            <h1 className="display-4 mb-4">🏠 Welcome to Hearth</h1>
            <p className="lead mb-4">
              Your digital home inventory system. Catalog and manage your physical items 
              with ease, complete with QR codes for quick lookup.
            </p>
            <div className="d-grid gap-2 d-md-flex justify-content-md-center">
              <Button href="/login" variant="primary" size="lg">
                Get Started
              </Button>
            </div>
          </Col>
        </Row>
        
        <Row className="mt-5">
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <h2 className="h5 mb-3">📦 Organize</h2>
                <p>Create containers and categorize your items for easy management.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <h2 className="h5 mb-3">📱 QR Codes</h2>
                <p>Generate QR codes for instant access to item information.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <h2 className="h5 mb-3">🔒 Private</h2>
                <p>Your inventory data is secure and only accessible to you.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="flex-grow-1">
      <Row>
        <Col>
          <h1 className="mb-4">Welcome back! 👋</h1>
          <p className="lead">Ready to manage your home inventory?</p>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title className="h5 mb-3">📦 Containers</Card.Title>
              <Card.Text>
                Manage your storage containers and organize your space.
              </Card.Text>
              <Button href="/containers" variant="primary">
                View Containers
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title className="h5 mb-3">📋 Items</Card.Title>
              <Card.Text>
                Browse and manage all your cataloged items.
              </Card.Text>
              <Button href="/items" variant="primary">
                View Items
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tag Cloud Section */}
      <Row className="mt-5">
        <Col>
          <div className="text-center">
            <TagCloud />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
