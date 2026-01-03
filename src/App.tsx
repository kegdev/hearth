
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import ErrorBoundary from './components/ErrorBoundary';
import AuthProvider from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AppNavbar from './components/Navbar';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import DemoModeIndicator from './components/DemoModeIndicator';
import InventoryStats from './components/InventoryStats';
import AccountStatusGuard from './components/AccountStatusGuard';
import { NotificationProvider } from './components/NotificationSystem';
import { useThemeStore } from './store/themeStore';
import { initializeEmailJS } from './services/emailNotificationService';
import './utils/validateFirebase'; // Run Firebase validation in development

// Import critical pages directly for offline support
import HomePage from './pages/HomePage';
import SimpleLoginPage from './pages/SimpleLoginPage';
import RegistrationRequestPage from './pages/RegistrationRequestPage';
import ContainersPage from './pages/ContainersPage';
import ContainerDetailPage from './pages/ContainerDetailPage';
import ItemsPage from './pages/ItemsPage';
import ItemDetailPage from './pages/ItemDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ShortUrlRedirectPage from './pages/ShortUrlRedirectPage';

// Lazy load admin page only (less critical for offline use)
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

// Loading component
const PageLoader = () => (
  <Container className="text-center mt-5">
    <Spinner animation="border" role="status" variant="primary">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </Container>
);

function App() {
  const { isDarkMode } = useThemeStore();

  // Initialize services on app startup
  useEffect(() => {
    // Initialize EmailJS for notifications
    initializeEmailJS();
  }, []);

  // Ensure theme is applied on every render
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        document.body.classList.add('bg-dark', 'text-light');
      } else {
        document.documentElement.setAttribute('data-bs-theme', 'light');
        document.body.classList.remove('bg-dark', 'text-light');
      }
    };
    
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <div className="d-flex flex-column min-vh-100">
              <AppNavbar />
              <DemoModeIndicator />
              <main className="py-3 flex-grow-1 d-flex flex-column">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<SimpleLoginPage />} />
                  <Route path="/request-access" element={<RegistrationRequestPage />} />
                  <Route path="/q/:shortCode" element={<ShortUrlRedirectPage />} />
                  <Route path="/*" element={
                    <AccountStatusGuard>
                      <Routes>
                        <Route 
                          path="/admin" 
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<PageLoader />}>
                                <AdminDashboardPage />
                              </Suspense>
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/containers" 
                          element={
                            <ProtectedRoute>
                              <ContainersPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/container/:containerId" 
                          element={
                            <ProtectedRoute>
                              <ContainerDetailPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/items" 
                          element={
                            <ProtectedRoute>
                              <ItemsPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/item/:itemId" 
                          element={
                            <ProtectedRoute>
                              <ItemDetailPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/search" 
                          element={
                            <ProtectedRoute>
                              <SearchResultsPage />
                            </ProtectedRoute>
                          } 
                        />
                        </Routes>
                      </AccountStatusGuard>
                    } />
                  </Routes>
              </main>
              <InventoryStats />
              <PWAUpdatePrompt />
            </div>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
