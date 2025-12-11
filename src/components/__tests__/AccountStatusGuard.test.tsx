import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import AccountStatusGuard from '../AccountStatusGuard';

// Mock the stores and services
jest.mock('../../store/authStore');
jest.mock('../../services/userRegistrationService');
jest.mock('../../services/authService');
jest.mock('../../utils/initializeAdmin');

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock the user registration service
const mockGetUserProfile = jest.fn();
const mockGetRegistrationRequestByEmail = jest.fn();
jest.mock('../../services/userRegistrationService', () => ({
  getUserProfile: mockGetUserProfile,
  getRegistrationRequestByEmail: mockGetRegistrationRequestByEmail
}));

// Mock the admin initialization
const mockSetupAdminProfile = jest.fn();
const mockIsAdminInitializationNeeded = jest.fn();
jest.mock('../../utils/initializeAdmin', () => ({
  setupAdminProfile: mockSetupAdminProfile,
  isAdminInitializationNeeded: mockIsAdminInitializationNeeded
}));

const renderAccountStatusGuard = (children: React.ReactNode = <div>Protected Content</div>) => {
  return render(
    <BrowserRouter>
      <AccountStatusGuard>{children}</AccountStatusGuard>
    </BrowserRouter>
  );
};

describe('AccountStatusGuard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserProfile.mockResolvedValue(null);
    mockGetRegistrationRequestByEmail.mockResolvedValue(null);
    mockIsAdminInitializationNeeded.mockReturnValue(false);
  });

  it('shows loading state initially', () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      loading: false
    });

    renderAccountStatusGuard();
    
    expect(screen.getByText('Checking account status...')).toBeInTheDocument();
  });

  it('renders children when user is not logged in', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      loading: false
    });

    renderAccountStatusGuard();
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('renders children when user is approved', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      loading: false
    });

    mockGetUserProfile.mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    renderAccountStatusGuard();
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('renders children when user is admin', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: 'admin-uid', email: 'borskaegel@gmail.com' },
      loading: false
    });

    mockGetUserProfile.mockResolvedValue({
      uid: 'admin-uid',
      email: 'borskaegel@gmail.com',
      status: 'admin',
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    renderAccountStatusGuard();
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('shows pending message when user has pending status', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      loading: false
    });

    mockGetUserProfile.mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    renderAccountStatusGuard();
    
    await waitFor(() => {
      expect(screen.getByText('Awaiting Approval')).toBeInTheDocument();
      expect(screen.getByText('Your registration request is being reviewed. You\'ll receive an email notification once it\'s processed.')).toBeInTheDocument();
    });
  });

  it('shows denied message when user has denied status', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      loading: false
    });

    mockGetUserProfile.mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      status: 'denied',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    renderAccountStatusGuard();
    
    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Unfortunately, your registration request has been denied.')).toBeInTheDocument();
    });
  });

  it('shows request access message when user has no profile', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      loading: false
    });

    mockGetUserProfile.mockResolvedValue(null);
    mockGetRegistrationRequestByEmail.mockResolvedValue(null);

    renderAccountStatusGuard();
    
    await waitFor(() => {
      expect(screen.getByText('Access Required')).toBeInTheDocument();
      expect(screen.getByText('Your account exists, but you need to request access to use Hearth.')).toBeInTheDocument();
      expect(screen.getByText('📧 Request Access')).toBeInTheDocument();
    });
  });

  it('shows pending message when user has pending registration request', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      loading: false
    });

    mockGetUserProfile.mockResolvedValue(null);
    mockGetRegistrationRequestByEmail.mockResolvedValue({
      id: 'request-id',
      email: 'test@example.com',
      status: 'pending',
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    renderAccountStatusGuard();
    
    await waitFor(() => {
      expect(screen.getByText('Awaiting Approval')).toBeInTheDocument();
    });
  });

  it('initializes admin profile for admin email', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { 
        uid: 'admin-uid', 
        email: 'borskaegel@gmail.com',
        displayName: 'Admin User'
      },
      loading: false
    });

    mockGetUserProfile.mockResolvedValueOnce(null); // First call returns null
    mockIsAdminInitializationNeeded.mockReturnValue(true);
    mockSetupAdminProfile.mockResolvedValue({
      uid: 'admin-uid',
      email: 'borskaegel@gmail.com',
      status: 'admin',
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    renderAccountStatusGuard();
    
    await waitFor(() => {
      expect(mockSetupAdminProfile).toHaveBeenCalledWith(
        'admin-uid',
        'borskaegel@gmail.com',
        'Admin User'
      );
    });
  });

  it('shows error message when profile loading fails', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      loading: false
    });

    mockGetUserProfile.mockRejectedValue(new Error('Network error'));

    renderAccountStatusGuard();
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Account')).toBeInTheDocument();
      expect(screen.getByText('Failed to load account status')).toBeInTheDocument();
    });
  });

  it('shows sign out button in all status screens', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      loading: false
    });

    mockGetUserProfile.mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    renderAccountStatusGuard();
    
    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });
});