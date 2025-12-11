import { render, fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import Navbar from '../Navbar';

// Mock the stores
jest.mock('../../store/authStore');
jest.mock('../../store/themeStore');

// Mock the auth service
jest.mock('../../services/authService', () => ({
  logoutUser: jest.fn()
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseThemeStore = useThemeStore as jest.MockedFunction<typeof useThemeStore>;

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default theme store mock
    mockUseThemeStore.mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: jest.fn(),
      setUser: jest.fn()
    });
  });

  it('renders brand logo and name', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    expect(screen.getByText('🏠 Hearth')).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows user icon with tooltip when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        uid: 'test-uid', 
        email: 'test@example.com',
        displayName: 'Test User'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    // Should show user icon
    expect(screen.getByText('🧑')).toBeInTheDocument();
    
    // Should have tooltip with email
    const userIcon = screen.getByTitle('Logged in as: test@example.com');
    expect(userIcon).toBeInTheDocument();
  });

  it('shows theme toggle button when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        uid: 'test-uid', 
        email: 'test@example.com',
        displayName: 'Test User'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    // Should show theme toggle (moon icon for light mode)
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('shows logout button when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        uid: 'test-uid', 
        email: 'test@example.com',
        displayName: 'Test User'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows admin link for admin users', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        uid: 'admin-uid', 
        email: '[admin_email]',
        displayName: 'Admin User'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
  });

  it('does not show admin link for regular users', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        uid: 'test-uid', 
        email: 'test@example.com',
        displayName: 'Test User'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
  });

  it('shows navigation links when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        uid: 'test-uid', 
        email: 'test@example.com',
        displayName: 'Test User'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Containers')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
  });

  it('handles dark mode theme correctly', () => {
    mockUseThemeStore.mockReturnValue({
      isDarkMode: true,
      toggleDarkMode: jest.fn(),
      setUser: jest.fn()
    });

    mockUseAuthStore.mockReturnValue({
      user: { 
        uid: 'test-uid', 
        email: 'test@example.com',
        displayName: 'Test User'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    // Should show sun icon in dark mode
    expect(screen.getByText('☀️')).toBeInTheDocument();
    
    // Should have dark mode title
    const themeButton = screen.getByTitle('Switch to Light Mode');
    expect(themeButton).toBeInTheDocument();
  });

  it('calls theme toggle when theme button is clicked', () => {
    const mockToggleDarkMode = jest.fn();
    
    mockUseThemeStore.mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: mockToggleDarkMode,
      setUser: jest.fn()
    });

    mockUseAuthStore.mockReturnValue({
      user: { 
        uid: 'test-uid', 
        email: 'test@example.com',
        displayName: 'Test User'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    renderNavbar();
    
    const themeButton = screen.getByTitle('Switch to Dark Mode');
    fireEvent.click(themeButton);
    
    expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
  });
});