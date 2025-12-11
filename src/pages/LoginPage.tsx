
import { useState } from 'react';
import { Button, Form, Container, Row, Col, Alert, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, loginWithGoogle } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const authFunction = activeTab === 'login' ? loginUser : registerUser;
    const { user: authUser, error: authError } = await authFunction(email, password);

    if (authError) {
      setError(authError);
    } else if (authUser) {
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    const { user: authUser, error: authError } = await loginWithGoogle();

    if (authError) {
      setError(authError);
    } else if (authUser) {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6}>
          <h2 className="text-center mb-4">Welcome to Hearth</h2>
          
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'login')}
            className="mb-3"
            justify
          >
            <Tab eventKey="login" title="Login">
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button 
                    variant="danger" 
                    onClick={handleGoogleSignIn} 
                    disabled={loading}
                    className="mb-2"
                  >
                    {loading ? 'Signing in...' : '🔍 Continue with Google'}
                  </Button>
                  
                  <div className="text-center my-2">
                    <small className="text-muted">or</small>
                  </div>
                  
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login with Email'}
                  </Button>
                </div>
              </Form>
            </Tab>
            
            <Tab eventKey="register" title="Sign Up">
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form.Group className="mb-3" controlId="formRegisterEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRegisterPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button 
                    variant="danger" 
                    onClick={handleGoogleSignIn} 
                    disabled={loading}
                    className="mb-2"
                  >
                    {loading ? 'Signing in...' : '🔍 Sign up with Google'}
                  </Button>
                  
                  <div className="text-center my-2">
                    <small className="text-muted">or</small>
                  </div>
                  
                  <Button variant="success" type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account with Email'}
                  </Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
