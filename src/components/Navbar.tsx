
import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { logoutUser } from '../services/authService';
import GlobalSearch from './GlobalSearch';

const AppNavbar = () => {
  const { user, loading } = useAuthStore();
  const { isDarkMode, toggleDarkMode, setUser } = useThemeStore();

  // Sync theme store with current user
  React.useEffect(() => {
    setUser(user?.uid || null);
  }, [user?.uid, setUser]);

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
                {/* Mobile-friendly Control Panel - show directly in nav on mobile */}
                <Nav.Link as={Link} to="/control-panel" className="d-lg-none">
                  ⚙️ Control Panel
                </Nav.Link>
              </>
            )}
            <NavDropdown title="About" id="about-nav-dropdown">
              <NavDropdown.Item as={Link} to="/about">About Hearth</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/contact">Contact & Support</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/privacy-policy">Privacy Policy</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/terms-of-service">Terms of Service</NavDropdown.Item>
            </NavDropdown>
            {user && user.email === import.meta.env.VITE_ADMIN_EMAIL && (
              <Nav.Link as={Link} to="/admin" className="text-warning fw-bold">
                🛡️ Admin
              </Nav.Link>
            )}
            {/* Mobile-friendly Logout - show directly in nav on mobile */}
            {user && (
              <Nav.Link onClick={handleLogout} className="d-lg-none text-danger">
                🚪 Logout
              </Nav.Link>
            )}
          </Nav>
          
          {/* Global Search - only show when user is logged in */}
          {user && (
            <>
              {/* Desktop Search - takes available space between nav items and user controls */}
              <div className="d-none d-lg-block flex-grow-1 mx-3" style={{ maxWidth: '500px' }}>
                <GlobalSearch placeholder="Search containers and items..." />
              </div>
              
              {/* Mobile Search - full width with proper spacing */}
              <div className="d-lg-none w-100 my-3 px-2">
                <GlobalSearch placeholder="Search containers and items..." />
              </div>
            </>
          )}
          
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
                  {/* Desktop-only user dropdown */}
                  <NavDropdown 
                    title="🧑" 
                    id="user-nav-dropdown"
                    className="d-none d-lg-flex align-items-center"
                  >
                    <NavDropdown.Item as={Link} to="/control-panel">
                      ⚙️ Control Panel
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>
                      🚪 Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                  {/* Mobile-only user indicator */}
                  <div 
                    className="d-lg-none btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
                    style={{ cursor: 'default' }}
                    title={`Logged in as: ${user.email}`}
                  >
                    🧑
                  </div>
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
