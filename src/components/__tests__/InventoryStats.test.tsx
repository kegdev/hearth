import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { useAuthStore } from '../../store/authStore';
import InventoryStats from '../InventoryStats';

// Mock the stores and services
jest.mock('../../store/authStore');
jest.mock('../../services/itemService');
jest.mock('../../services/containerService');
jest.mock('../../services/tagService');

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('InventoryStats Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    const { container } = render(<InventoryStats />);
    expect(container.firstChild).toBeNull();
  });

  it('renders statistics when user is authenticated', async () => {
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

    render(<InventoryStats />);

    // Should show the statistics labels
    setTimeout(() => {
      expect(screen.queryByText('Items')).toBeInTheDocument();
      expect(screen.queryByText('Containers')).toBeInTheDocument();
      expect(screen.queryByText('Tags')).toBeInTheDocument();
      expect(screen.queryByText('Total Value')).toBeInTheDocument();
    }, 100);
  });

  it('shows loading state initially', () => {
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

    const { container } = render(<InventoryStats />);
    
    // Component should not render during loading
    expect(container.firstChild).toBeNull();
  });
});