import { shortUrlService } from '../shortUrlService';

// Mock Firebase
jest.mock('../../firebase/config', () => ({
  db: null,
  isFirebaseConfigured: false
}));

describe('ShortUrlService', () => {
  describe('generateShortCode', () => {
    it('generates 6-character codes', () => {
      // Access private method for testing
      const service = shortUrlService as any;
      const shortCode = service.generateShortCode();
      
      expect(shortCode).toHaveLength(6);
      expect(shortCode).toMatch(/^[0-9a-z]+$/);
    });

    it('generates different codes on multiple calls', () => {
      const service = shortUrlService as any;
      const code1 = service.generateShortCode();
      const code2 = service.generateShortCode();
      
      expect(code1).not.toBe(code2);
    });
  });

  describe('in demo mode', () => {
    it('handles createShortUrl gracefully', async () => {
      // Should not throw in demo mode
      await expect(
        shortUrlService.createShortUrl('/item/test', 'user123', 'item', 'test')
      ).rejects.toThrow('Unable to generate unique short code');
    });

    it('handles getOriginalUrl gracefully', async () => {
      const result = await shortUrlService.getOriginalUrl('abc123');
      expect(result).toBeNull();
    });
  });
});