import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { submitRegistrationRequest, getRegistrationRequestByEmail } from '../services/userRegistrationService';
import { useNotifications } from '../components/NotificationSystem';
import { useAuthStore } from '../store/authStore';
import type { CreateRegistrationRequestData } from '../types';

const RegistrationRequestPage = () => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<CreateRegistrationRequestData>({
    email: user?.email || '',
    displayName: user?.displayName || '',
    reason: '',
    uid: user?.uid || '', // Add UID to form data
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const { showSuccess, showError } = useNotifications();

  // Update form data when user changes
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        displayName: user.displayName || prev.displayName,
        uid: user.uid || '', // Update UID when user changes
      }));
      checkExistingRequest(user.email);
    }
  }, [user]);

  const checkExistingRequest = async (email: string) => {
    try {
      setCheckingExisting(true);
      const existing = await getRegistrationRequestByEmail(email);
      setExistingRequest(existing);
    } catch (error) {
      console.error('Error checking existing request:', error);
    } finally {
      setCheckingExisting(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submissions
    if (isSubmitting || loading) {
      return;
    }
    
    if (!formData.reason.trim()) {
      setError('Please tell us why you want to use Hearth.');
      return;
    }

    if (!formData.email) {
      setError('Email address is required. Please make sure you are logged in.');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError('');

    try {
      await submitRegistrationRequest(formData);
      
      showSuccess(
        'Request Submitted! 📧',
        'Your registration request has been submitted for review. You\'ll receive an email when it\'s processed.'
      );
      
      setSubmitted(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit registration request. Please try again.';
      setError(errorMessage);
      showError('Request Failed', errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Show loading while checking for existing requests
  if (checkingExisting) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={8} lg={6}>
            <Card className="text-center">
              <Card.Body className="py-5">
                <div className="spinner-border mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Checking your request status...</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Show denied message if user has been denied
  if (existingRequest && existingRequest.status === 'denied') {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={8} lg={6}>
            <Card className="text-center border-danger">
              <Card.Body className="py-5">
                <div className="mb-4">
                  <h1 className="display-1">❌</h1>
                  <h2 className="text-danger">Access Request Denied</h2>
                </div>
                
                <p className="lead mb-4">
                  Your registration request for <strong>{existingRequest.email}</strong> has been denied.
                </p>
                
                {existingRequest.reviewNotes && (
                  <div className="mb-4">
                    <h6>Reason:</h6>
                    <div className="border rounded p-3 bg-light">
                      <div className="text-dark">
                        {existingRequest.reviewNotes}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-muted">
                    If you believe this was a mistake or have questions about this decision, 
                    please contact our support team.
                  </p>
                </div>
                
                <div className="border-top pt-4">
                  <p className="text-muted mb-3">
                    <strong>Need help?</strong> Contact us at{' '}
                    <a href="mailto:[support_email]">[support_email]</a>
                  </p>
                  
                  <Link to="/" className="btn btn-outline-primary">
                    ← Back to Home
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Show pending message if user already has a pending request
  if (existingRequest && existingRequest.status === 'pending') {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={8} lg={6}>
            <Card className="text-center">
              <Card.Body className="py-5">
                <div className="mb-4">
                  <h1 className="display-1">⏳</h1>
                  <h2 className="text-info">Request Already Submitted</h2>
                </div>
                
                <p className="lead mb-4">
                  You already have a pending registration request for <strong>{existingRequest.email}</strong>.
                </p>
                
                <div className="mb-4">
                  <h6>Submitted on:</h6>
                  <p className="text-muted">
                    {new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(existingRequest.requestedAt)}
                  </p>
                </div>
                
                <div className="mb-4">
                  <h5>What's happening?</h5>
                  <ul className="list-unstyled text-muted">
                    <li>📧 Your request is in the review queue</li>
                    <li>👀 An administrator will review your application</li>
                    <li>✉️ You'll be notified via email when processed</li>
                  </ul>
                </div>
                
                <div className="border-top pt-4">
                  <p className="text-muted mb-3">
                    <strong>Questions?</strong> Contact us at{' '}
                    <a href="mailto:[support_email]">[support_email]</a>
                  </p>
                  
                  <Link to="/" className="btn btn-outline-primary">
                    ← Back to Home
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={8} lg={6}>
            <Card className="text-center">
              <Card.Body className="py-5">
                <div className="mb-4">
                  <h1 className="display-1">📧</h1>
                  <h2 className="text-success">Request Submitted!</h2>
                </div>
                
                <p className="lead mb-4">
                  Thank you for your interest in Hearth! Your registration request has been submitted for review.
                </p>
                
                <div className="mb-4">
                  <h5>What happens next?</h5>
                  <ul className="list-unstyled text-muted">
                    <li>✅ Your request is now in the review queue</li>
                    <li>📧 You'll receive an email notification when it's processed</li>
                    <li>🏠 Once approved, you can start building your inventory</li>
                  </ul>
                </div>
                
                <div className="border-top pt-4">
                  <p className="text-muted mb-3">
                    <strong>Questions?</strong> Contact us at{' '}
                    <a href="mailto:[support_email]">[support_email]</a>
                  </p>
                  
                  <Link to="/" className="btn btn-outline-primary">
                    ← Back to Home
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header className="text-center bg-primary text-white">
              <h3 className="mb-0">🏠 Request Access to Hearth</h3>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <p className="text-muted">
                  Hearth is currently in private beta. Please fill out this form to request access to our home inventory management system.
                </p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    disabled={true}
                    readOnly
                    className="bg-light text-dark"
                  />
                  <Form.Text className="text-muted">
                    Using your logged-in account email. We'll notify you when your request is processed.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Display Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your Name (optional)"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Why do you want to use Hearth? *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Tell us about your home inventory needs, how you plan to use Hearth, or what brought you here..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    This helps us understand our users and prioritize access requests.
                  </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting Request...
                      </>
                    ) : (
                      '📧 Submit Registration Request'
                    )}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-4 pt-3 border-top">
                <p className="text-muted mb-2">
                  <small>
                    By submitting this request, you agree to our{' '}
                    <Link to="/terms">Terms of Service</Link> and{' '}
                    <Link to="/privacy">Privacy Policy</Link>.
                  </small>
                </p>
                
                <Link to="/" className="text-decoration-none">
                  ← Back to Home
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegistrationRequestPage;