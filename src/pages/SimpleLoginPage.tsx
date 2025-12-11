import { useState } from 'react';
import { Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useNotifications } from '../components/NotificationSystem';

const SimpleLoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    const { user: authUser, error: authError } = await loginWithGoogle();

    if (authError) {
      setError(authError);
      showError('Sign-in Failed', 'Please try again or check your internet connection.');
    } else if (authUser) {
      showSuccess('Welcome to Hearth! 🎉', 'You\'re all set to start organizing your home!');
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6}>
          <Card className="shadow">
            <Card.Body className="text-center p-5">
              <div className="mb-4">
                <h1 className="display-6">🏠</h1>
                <h2 className="mb-3">Welcome to Hearth</h2>
                <p className="text-muted">
                  Your digital home inventory system. Sign in to get started organizing your items.
                </p>
              </div>

              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              
              <div className="d-grid">
                <Button 
                  variant="danger" 
                  size="lg"
                  onClick={handleGoogleSignIn} 
                  disabled={loading}
                  className="py-3"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Signing in...
                    </>
                  ) : (
                    <>🔍 Continue with Google</>
                  )}
                </Button>
              </div>

              <div className="mt-4">
                <small className="text-muted">
                  Secure sign-in powered by Google. Your data stays private and is only accessible to you.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SimpleLoginPage;