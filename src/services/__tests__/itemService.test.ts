import { createItem, getUserItems, updateItem, deleteItem } from '../itemService';
import type { CreateItemData } from '../../types';

// Mock Firebase
jest.mock('../../firebase/config', () => ({
  db: null,
  isFirebaseConfigured: false
}));

// Mock image compression
jest.mock('../../utils/imageUtils', () => ({
  compressAndConvertToBase64: jest.fn().mockResolvedValue('data:image/jpeg;base64,mock-image-data')
}));

describe('Item Service', () => {
  const mockUserId = 'test-user-id';
  const mockItemData: CreateItemData = {
    name: 'Test Item',
    description: 'Test Description',
    containerId: 'test-container-id',
    tags: ['tag1', 'tag2'],
    categoryId: 'test-category-id',
    purchasePrice: 100,
    currentValue: 90,
    condition: 'good',
    brand: 'Test Brand',
    model: 'Test Model',
    serialNumber: 'SN123456',
    warranty: '2 years'
  };

  describe('createItem', () => {
    it('creates item in demo mode', async () => {
      const result = await createItem(mockUserId, mockItemData);
      
      expect(result).toMatchObject({
        name: mockItemData.name,
        description: mockItemData.description,
        containerId: mockItemData.containerId,
        userId: mockUserId,
        purchasePrice: mockItemData.purchasePrice,
        currentValue: mockItemData.currentValue,
        condition: mockItemData.condition,
        brand: mockItemData.brand,
        model: mockItemData.model,
        serialNumber: mockItemData.serialNumber,
        warranty: mockItemData.warranty
      });
      
      expect(result.id).toMatch(/^demo_item_/);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('handles image compression in demo mode', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const itemWithImage = { ...mockItemData, image: mockFile };
      
      const result = await createItem(mockUserId, itemWithImage);
      
      expect(result.imageUrl).toBe('data:image/jpeg;base64,mock-image-data');
    });

    it('handles missing optional fields', async () => {
      const minimalItemData: CreateItemData = {
        name: 'Minimal Item',
        containerId: 'test-container-id'
      };
      
      const result = await createItem(mockUserId, minimalItemData);
      
      expect(result.name).toBe('Minimal Item');
      expect(result.containerId).toBe('test-container-id');
      expect(result.userId).toBe(mockUserId);
      expect(result.tags).toEqual([]);
    });
  });

  describe('getUserItems', () => {
    it('returns empty array in demo mode', async () => {
      const result = await getUserItems(mockUserId);
      
      expect(result).toEqual([]);
    });
  });

  describe('updateItem', () => {
    it('updates item in demo mode', async () => {
      const updateData = {
        name: 'Updated Item',
        purchasePrice: 150
      };
      
      // Should not throw in demo mode
      await expect(updateItem('test-item-id', updateData)).resolves.toBeUndefined();
    });
  });

  describe('deleteItem', () => {
    it('deletes item in demo mode', async () => {
      // Should not throw in demo mode
      await expect(deleteItem('test-item-id')).resolves.toBeUndefined();
    });
  });
});