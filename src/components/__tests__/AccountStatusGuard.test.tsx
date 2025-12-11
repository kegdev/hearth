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

// Import the mocked modules
const mockUserRegistrationService = jest.requireMock('../../services/userRegistrationService');
const mockInitializeAdmin = jest.requireMock('../../utils/initializeAdmin');

const renderAccountStatusGuard = (children: React.ReactNode = <div>Protected Content</div>) => {
  return render(
    <BrowserRouter>
      <AccountStatusGuard>{children}</AccountStatusGuard>
    </BrowserRouter>
  );
};

describe.skip('AccountStatusGuard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRegistrationService.getUserProfile.mockResolvedValue(null);
    mockUserRegistrationService.getRegistrationRequestByEmail.mockResolvedValue(null);
    mockInitializeAdmin.isAdminInitializationNeeded.mockReturnValue(false);
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

    mockUserRegistrationService.getUserProfile.mockResolvedValue({
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
});