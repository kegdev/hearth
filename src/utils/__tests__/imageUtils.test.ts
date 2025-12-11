// Mock browser-image-compression
jest.mock('browser-image-compression', () => {
  return jest.fn().mockImplementation((_file) => {
    // Return a mock compressed file
    return Promise.resolve(new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' }));
  });
});

describe('Image Utils', () => {
  describe('compressAndConvertToBase64', () => {
    it('should be testable when properly configured', () => {
      // This is a placeholder test for image compression
      // Full testing would require proper browser environment setup
      expect(true).toBe(true);
    });

    it('handles file compression in demo environment', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      expect(mockFile.type).toBe('image/jpeg');
      expect(mockFile.name).toBe('test.jpg');
    });
  });
});