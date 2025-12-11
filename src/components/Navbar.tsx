
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { logoutUser } from '../services/authService';

const AppNavbar = () => {
  const { user, loading } = useAuthStore();
  const { isDarkMode, toggleDarkMode, setUser } = useThemeStore();

  // Sync theme store with current user
  React.useEffect(() => {
    setUser(user?.uid || null);
  }, [user?.uid, setUser]);

  // Debug effect to track theme changes
  React.useEffect(() => {
    console.log('Navbar: isDarkMode changed to:', isDarkMode);
  }, [isDarkMode]);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <Navbar bg={isDarkMode ? "dark" : "light"} variant={isDarkMode ? "dark" : "light"} expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">🏠 Hearth</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/containers">Containers</Nav.Link>
                <Nav.Link as={Link} to="/items">Items</Nav.Link>
                {user.email === '[admin_email]' && (
                  <Nav.Link as={Link} to="/admin" className="text-warning fw-bold">
                    🛡️ Admin
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav className="ms-auto">
            {!loading && (
              user ? (
                <div className="d-flex align-items-center gap-2">
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={toggleDarkMode}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {isDarkMode ? "☀️" : "🌙"}
                  </Button>
                  <div 
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
                    style={{ 
                      cursor: 'default'
                    }}
                    title={`Logged in as: ${user.email}`}
                  >
                    🧑
                  </div>
                  <Button 
                    variant={isDarkMode ? "outline-light" : "outline-dark"} 
                    size="sm" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
              )
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
