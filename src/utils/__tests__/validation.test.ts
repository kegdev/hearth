import { validateEmail, validateItemName, validateContainerName } from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('simple@test.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('test.domain.com')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(validateEmail('a@b.co')).toBe(true);
      expect(validateEmail('test@localhost.com')).toBe(true);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('validateItemName', () => {
    it('validates correct item names', () => {
      expect(validateItemName('Valid Item Name')).toBe(true);
      expect(validateItemName('Item123')).toBe(true);
      expect(validateItemName('A')).toBe(true);
    });

    it('rejects invalid item names', () => {
      expect(validateItemName('')).toBe(false);
      expect(validateItemName('   ')).toBe(false);
      expect(validateItemName('a'.repeat(101))).toBe(false); // Too long
    });
  });

  describe('validateContainerName', () => {
    it('validates correct container names', () => {
      expect(validateContainerName('Living Room Box')).toBe(true);
      expect(validateContainerName('Container #1')).toBe(true);
      expect(validateContainerName('Storage')).toBe(true);
    });

    it('rejects invalid container names', () => {
      expect(validateContainerName('')).toBe(false);
      expect(validateContainerName('   ')).toBe(false);
      expect(validateContainerName('a'.repeat(101))).toBe(false); // Too long
    });
  });
});