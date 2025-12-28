import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getUserProfile, getRegistrationRequestByEmail } from '../services/userRegistrationService';
import { logoutUser } from '../services/authService';
import { setupAdminProfile, isAdminInitializationNeeded } from '../utils/initializeAdmin';
import { offlineCacheService } from '../services/offlineCacheService';
import type { UserProfile } from '../types';

interface AccountStatusGuardProps {
  children: React.ReactNode;
}

const AccountStatusGuard = ({ children }: AccountStatusGuardProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [registrationRequest, setRegistrationRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [usingCachedData, setUsingCachedData] = useState(false);

  const { user } = useAuthStore();

  const handleLogout = async () => {
    // Clear all caches on logout
    offlineCacheService.clearAllCaches();
    await logoutUser();
  };

  const handleRefresh = () => {
    // Force cache refresh and reload
    offlineCacheService.forceCacheRefresh();
    loadUserProfile();
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Reload data when coming back online
      if (user) {
        loadUserProfile();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

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
      setError('');
      
      // Check if we should use cached data (offline or valid cache exists)
      const shouldUseCache = offlineCacheService.shouldUseCachedData(user.uid);
      const isActuallyOffline = offlineCacheService.isInOfflineMode();
      
      if (shouldUseCache) {
        const cachedData = offlineCacheService.getCachedProfile(user.uid);
        const cachedStatus = offlineCacheService.getCachedAccountStatus(user.uid);
        
        if (cachedData || cachedStatus) {
          console.log('📱 Using cached account data', isActuallyOffline ? '(offline mode)' : '(performance)');
          
          if (cachedData) {
            setUserProfile(cachedData.profile);
            setRegistrationRequest(cachedData.registrationRequest);
          } else if (cachedStatus) {
            // Create minimal profile from cached status
            if (cachedStatus.hasProfile) {
              setUserProfile({
                uid: user.uid,
                email: cachedStatus.email || user.email || '',
                displayName: cachedStatus.displayName,
                status: cachedStatus.status,
                isAdmin: cachedStatus.status === 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            } else {
              setRegistrationRequest({
                email: cachedStatus.email || user.email,
                displayName: cachedStatus.displayName,
                status: cachedStatus.status,
              });
            }
          }
          
          setUsingCachedData(isActuallyOffline); // Only show as "using cached data" if actually offline
          setLoading(false);
          return;
        }
      }

      // If online and no valid cache, fetch fresh data
      if (offlineCacheService.isOnline()) {
        setUsingCachedData(false);
        
        let profile = await getUserProfile(user.uid);
        
        // If no profile exists and this is the admin email, initialize admin profile
        if (!profile && user.email && isAdminInitializationNeeded(user.email)) {
          console.log('🔧 Initializing admin profile for:', user.email);
          profile = await setupAdminProfile(user.uid, user.email, user.displayName || undefined);
        }
        
        setUserProfile(profile);

        // If no user profile exists, check for registration requests
        let request = null;
        if (!profile && user.email) {
          request = await getRegistrationRequestByEmail(user.email);
          setRegistrationRequest(request);
        }

        // Cache the fresh data
        offlineCacheService.cacheProfile(user.uid, profile, request);
      } else {
        // Offline with no cache - show error
        throw new Error('No internet connection and no cached data available');
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      
      // Try to use any available cached data as fallback
      const cachedData = offlineCacheService.getCachedProfile(user.uid);
      const cachedStatus = offlineCacheService.getCachedAccountStatus(user.uid);
      
      if (cachedData || cachedStatus) {
        console.log('📱 Falling back to cached data due to error');
        
        if (cachedData) {
          setUserProfile(cachedData.profile);
          setRegistrationRequest(cachedData.registrationRequest);
        } else if (cachedStatus && cachedStatus.hasProfile) {
          setUserProfile({
            uid: user.uid,
            email: cachedStatus.email || user.email || '',
            displayName: cachedStatus.displayName,
            status: cachedStatus.status,
            isAdmin: cachedStatus.status === 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        
        setUsingCachedData(true);
        setError('Using offline data - some features may be limited');
      } else {
        setError(isOffline ? 'No internet connection' : 'Failed to load account status');
      }
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
        <p className="mt-3 text-muted">
          {isOffline ? 'Loading offline data...' : 'Checking account status...'}
        </p>
      </Container>
    );
  }

  // Offline indicator component
  const OfflineIndicator = () => {
    if (!usingCachedData && !isOffline) return null;
    
    const cacheAge = user ? offlineCacheService.getCacheAge(user.uid) : null;
    
    return (
      <Alert variant="info" className="mb-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <span className="me-2">📱</span>
          <div>
            <strong>Offline Mode</strong>
            {cacheAge !== null && (
              <small className="d-block text-muted">
                Data from {cacheAge} minutes ago
              </small>
            )}
          </div>
        </div>
        {offlineCacheService.isOnline() && (
          <Button variant="outline-info" size="sm" onClick={handleRefresh}>
            🔄 Refresh
          </Button>
        )}
      </Alert>
    );
  };

  // Show error state
  if (error && !usingCachedData) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Alert variant="danger">
              <h4>Error Loading Account</h4>
              <p>{error}</p>
              <div className="d-grid gap-2">
                <Button variant="outline-danger" onClick={loadUserProfile}>
                  Try Again
                </Button>
                {isOffline && (
                  <small className="text-muted text-center">
                    Check your internet connection and try again
                  </small>
                )}
              </div>
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
          <OfflineIndicator />
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
                        <div className="text-body">
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
          <OfflineIndicator />
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
                      {!isOffline && (
                        <Button variant="outline-primary" onClick={loadUserProfile}>
                          🔄 Check Status
                        </Button>
                      )}
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
        <OfflineIndicator />
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
                  {!isOffline ? (
                    <Link to="/request-access" className="btn btn-primary btn-lg">
                      📧 Request Access
                    </Link>
                  ) : (
                    <Alert variant="warning" className="mb-3">
                      <small>Access request requires internet connection</small>
                    </Alert>
                  )}
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
          <OfflineIndicator />
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
                      {!isOffline && (
                        <Button variant="outline-primary" onClick={loadUserProfile}>
                          🔄 Check Status
                        </Button>
                      )}
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
          <OfflineIndicator />
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
      // User is approved, show the app with offline indicator if needed
      return (
        <>
          {(usingCachedData || isOffline || error) && (
            <Container className="mt-3">
              <OfflineIndicator />
              {error && usingCachedData && (
                <Alert variant="warning" className="mb-3">
                  <small>{error}</small>
                </Alert>
              )}
            </Container>
          )}
          {children}
        </>
      );
    
    case 'admin':
      // Admin users get full access with offline indicator if needed
      return (
        <>
          {(usingCachedData || isOffline || error) && (
            <Container className="mt-3">
              <OfflineIndicator />
              {error && usingCachedData && (
                <Alert variant="warning" className="mb-3">
                  <small>{error}</small>
                </Alert>
              )}
            </Container>
          )}
          {children}
        </>
      );

    default:
      return (
        <Container className="mt-5">
          <OfflineIndicator />
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