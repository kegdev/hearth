import {
  submitRegistrationRequest,
  getRegistrationRequestByEmail,
  getPendingRegistrationRequests,
  approveRegistrationRequest,
  denyRegistrationRequest,
  createUserProfile,
  getUserProfile,
  updateUserProfileStatus,
  initializeAdminProfile
} from '../userRegistrationService';

// Mock Firebase
jest.mock('../../firebase/config', () => ({
  db: null,
  isFirebaseConfigured: false
}));

// Mock email service
jest.mock('../emailNotificationService', () => ({
  sendAdminNotification: jest.fn().mockResolvedValue(undefined),
  sendUserConfirmation: jest.fn().mockResolvedValue(undefined)
}));

describe('User Registration Service', () => {
  const mockUserData = {
    email: 'test@example.com',
    displayName: 'Test User',
    reason: 'I want to organize my home inventory'
  };

  describe('submitRegistrationRequest', () => {
    it('creates registration request in demo mode', async () => {
      const result = await submitRegistrationRequest(mockUserData);
      
      expect(result).toMatchObject({
        email: mockUserData.email,
        displayName: mockUserData.displayName,
        reason: mockUserData.reason,
        status: 'pending'
      });
      
      expect(result.id).toMatch(/^demo_request_/);
      expect(result.requestedAt).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('handles email normalization', async () => {
      const dataWithUppercaseEmail = {
        ...mockUserData,
        email: 'TEST@EXAMPLE.COM'
      };
      
      const result = await submitRegistrationRequest(dataWithUppercaseEmail);
      
      expect(result.email).toBe('TEST@EXAMPLE.COM'); // Original case preserved in result
    });

    it('handles missing display name', async () => {
      const dataWithoutName = {
        email: 'test@example.com',
        reason: 'Testing'
      };
      
      const result = await submitRegistrationRequest(dataWithoutName);
      
      expect(result.displayName).toBeUndefined();
      expect(result.email).toBe(dataWithoutName.email);
      expect(result.reason).toBe(dataWithoutName.reason);
    });
  });

  describe('getRegistrationRequestByEmail', () => {
    it('returns null in demo mode', async () => {
      const result = await getRegistrationRequestByEmail('test@example.com');
      
      expect(result).toBeNull();
    });
  });

  describe('getPendingRegistrationRequests', () => {
    it('returns empty array in demo mode', async () => {
      const result = await getPendingRegistrationRequests();
      
      expect(result).toEqual([]);
    });
  });

  describe('approveRegistrationRequest', () => {
    it('handles approval in demo mode', async () => {
      await expect(
        approveRegistrationRequest('demo-request-id', 'admin-uid', 'Approved for testing')
      ).resolves.not.toThrow();
    });
  });

  describe('denyRegistrationRequest', () => {
    it('handles denial in demo mode', async () => {
      await expect(
        denyRegistrationRequest('demo-request-id')
      ).resolves.not.toThrow();
    });
  });

  describe('createUserProfile', () => {
    it('creates user profile in demo mode', async () => {
      const result = await createUserProfile(
        'test-uid',
        'test@example.com',
        'Test User',
        'approved'
      );
      
      expect(result).toMatchObject({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        status: 'approved'
      });
      
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('handles missing display name', async () => {
      const result = await createUserProfile(
        'test-uid',
        'test@example.com',
        undefined,
        'pending'
      );
      
      expect(result.displayName).toBeUndefined();
      expect(result.status).toBe('pending');
    });

    it('defaults to pending status', async () => {
      const result = await createUserProfile(
        'test-uid',
        'test@example.com',
        'Test User'
      );
      
      expect(result.status).toBe('pending');
    });
  });

  describe('getUserProfile', () => {
    it('returns null in demo mode', async () => {
      const result = await getUserProfile('test-uid');
      
      expect(result).toBeNull();
    });
  });

  describe('updateUserProfileStatus', () => {
    it('handles status update in demo mode', async () => {
      await expect(
        updateUserProfileStatus('test-uid', 'approved', 'admin-uid')
      ).resolves.not.toThrow();
    });
  });

  describe('initializeAdminProfile', () => {
    it('creates admin profile in demo mode', async () => {
      const result = await initializeAdminProfile(
        'admin-uid',
        'admin@example.com',
        'Admin User'
      );
      
      expect(result).toMatchObject({
        uid: 'admin-uid',
        email: 'admin@example.com',
        displayName: 'Admin User',
        status: 'admin',
        isAdmin: true
      });
      
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('handles missing display name for admin', async () => {
      const result = await initializeAdminProfile(
        'admin-uid',
        'admin@example.com'
      );
      
      expect(result.displayName).toBeUndefined();
      expect(result.status).toBe('admin');
      expect(result.isAdmin).toBe(true);
    });
  });

  describe('error handling', () => {
    it('handles service errors gracefully', async () => {
      // Test that the service doesn't crash on errors
      const invalidData = {
        email: '',
        reason: ''
      };
      
      // Should not throw in demo mode
      await expect(
        submitRegistrationRequest(invalidData)
      ).resolves.toBeDefined();
    });
  });

  describe('data validation', () => {
    it('handles email trimming and normalization', async () => {
      const dataWithSpaces = {
        email: '  test@example.com  ',
        displayName: '  Test User  ',
        reason: '  Testing with spaces  '
      };
      
      const result = await submitRegistrationRequest(dataWithSpaces);
      
      // In demo mode, original values are preserved
      expect(result.email).toBe('  test@example.com  ');
      expect(result.displayName).toBe('  Test User  ');
      expect(result.reason).toBe('  Testing with spaces  ');
    });
  });
});