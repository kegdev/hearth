import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getUserProfile, getRegistrationRequestByEmail } from '../services/userRegistrationService';
import { logoutUser } from '../services/authService';
import { setupAdminProfile, isAdminInitializationNeeded } from '../utils/initializeAdmin';
import type { UserProfile } from '../types';

interface AccountStatusGuardProps {
  children: React.ReactNode;
}

const AccountStatusGuard = ({ children }: AccountStatusGuardProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [registrationRequest, setRegistrationRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuthStore();

  const handleLogout = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let profile = await getUserProfile(user.uid);
      
      // If no profile exists and this is the admin email, initialize admin profile
      if (!profile && user.email && isAdminInitializationNeeded(user.email)) {
        console.log('🔧 Initializing admin profile for:', user.email);
        profile = await setupAdminProfile(user.uid, user.email, user.displayName || undefined);
      }
      
      setUserProfile(profile);

      // If no user profile exists, check for registration requests
      if (!profile && user.email) {
        const request = await getRegistrationRequestByEmail(user.email);
        setRegistrationRequest(request);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load account status');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Checking account status...</p>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Alert variant="danger">
              <h4>Error Loading Account</h4>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={loadUserProfile}>
                Try Again
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // If user is not logged in, show children (login page, etc.)
  if (!user) {
    return <>{children}</>;
  }

  // If no profile exists, check registration request status
  if (!userProfile) {
    // If user has been denied, show denial message
    if (registrationRequest && registrationRequest.status === 'denied') {
      return (
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="text-center border-danger">
                <Card.Body className="py-5">
                  <div className="mb-4">
                    <h1 className="display-1">❌</h1>
                    <h2 className="text-danger">Access Denied</h2>
                  </div>
                  
                  <p className="lead mb-4">
                    Your registration request for <strong>{registrationRequest.email}</strong> has been denied.
                  </p>
                  
                  {registrationRequest.reviewNotes && (
                    <div className="mb-4">
                      <h6>Reason:</h6>
                      <div className="border rounded p-3 bg-light">
                        <div className="text-dark">
                          {registrationRequest.reviewNotes}
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
                    
                    <Button variant="outline-secondary" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }

    // If user has pending request, show pending message
    if (registrationRequest && registrationRequest.status === 'pending') {
      return (
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="text-center">
                <Card.Body className="py-5">
                  <div className="mb-4">
                    <h1 className="display-1">⏳</h1>
                    <h2 className="text-info">Awaiting Approval</h2>
                  </div>
                  
                  <p className="lead mb-4">
                    Your registration request is being reviewed. You'll receive an email notification once it's processed.
                  </p>
                  
                  <div className="mb-4">
                    <h5>What's happening?</h5>
                    <ul className="list-unstyled text-muted">
                      <li>📧 Your request is in the review queue</li>
                      <li>👀 An administrator will review your application</li>
                      <li>✉️ You'll be notified via email when approved</li>
                    </ul>
                  </div>
                  
                  <div className="border-top pt-4">
                    <p className="text-muted mb-3">
                      <strong>Questions?</strong> Contact us at{' '}
                      <a href="mailto:[support_email]">[support_email]</a>
                    </p>
                    
                    <div className="d-grid gap-2">
                      <Button variant="outline-primary" onClick={loadUserProfile}>
                        🔄 Check Status
                      </Button>
                      <Button variant="outline-secondary" onClick={handleLogout}>
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }

    // No profile and no registration request - user needs to request access
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="text-center">
              <Card.Body className="py-5">
                <div className="mb-4">
                  <h1 className="display-1">🔒</h1>
                  <h2 className="text-warning">Access Required</h2>
                </div>
                
                <p className="lead mb-4">
                  Your account exists, but you need to request access to use Hearth.
                </p>
                
                <div className="d-grid gap-2">
                  <Link to="/request-access" className="btn btn-primary btn-lg">
                    📧 Request Access
                  </Link>
                  <Button variant="outline-secondary" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Handle different account statuses
  switch (userProfile.status) {
    case 'pending':
      return (
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="text-center">
                <Card.Body className="py-5">
                  <div className="mb-4">
                    <h1 className="display-1">⏳</h1>
                    <h2 className="text-info">Awaiting Approval</h2>
                  </div>
                  
                  <p className="lead mb-4">
                    Your registration request is being reviewed. You'll receive an email notification once it's processed.
                  </p>
                  
                  <div className="mb-4">
                    <h5>What's happening?</h5>
                    <ul className="list-unstyled text-muted">
                      <li>📧 Your request is in the review queue</li>
                      <li>👀 An administrator will review your application</li>
                      <li>✉️ You'll be notified via email when approved</li>
                    </ul>
                  </div>
                  
                  <div className="border-top pt-4">
                    <p className="text-muted mb-3">
                      <strong>Questions?</strong> Contact us at{' '}
                      <a href="mailto:[support_email]">[support_email]</a>
                    </p>
                    
                    <div className="d-grid gap-2">
                      <Button variant="outline-primary" onClick={loadUserProfile}>
                        🔄 Check Status
                      </Button>
                      <Button variant="outline-secondary" onClick={handleLogout}>
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );

    case 'denied':
      return (
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="text-center border-danger">
                <Card.Body className="py-5">
                  <div className="mb-4">
                    <h1 className="display-1">❌</h1>
                    <h2 className="text-danger">Access Denied</h2>
                  </div>
                  
                  <p className="lead mb-4">
                    Unfortunately, your registration request has been denied.
                  </p>
                  
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
                    
                    <Button variant="outline-secondary" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );

    case 'approved':
      // User is approved, show the app
      return <>{children}</>;
    
    case 'admin':
      // Admin users get full access
      return <>{children}</>;

    default:
      return (
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Alert variant="warning">
                <h4>Unknown Account Status</h4>
                <p>There's an issue with your account status. Please contact support.</p>
                <Button variant="outline-warning" onClick={handleLogout}>
                  Sign Out
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
      );
  }
};

export default AccountStatusGuard;