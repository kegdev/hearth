import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-body-tertiary border-top mt-auto py-3">
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <div className="d-flex flex-wrap gap-3 small">
              <Link to="/about" className="text-decoration-none text-muted">About</Link>
              <Link to="/contact" className="text-decoration-none text-muted">Contact</Link>
              <Link to="/privacy-policy" className="text-decoration-none text-muted">Privacy</Link>
              <Link to="/terms-of-service" className="text-decoration-none text-muted">Terms</Link>
            </div>
          </Col>
          <Col md={6} className="text-md-end">
            <small className="text-muted">
              © {currentYear} Hearth - Home Inventory Management
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;