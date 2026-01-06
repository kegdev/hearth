import { dataExportService } from '../dataExportService';
import type { ExportData } from '../dataExportService';

// Mock Firebase
jest.mock('../../firebase/config', () => ({
  db: null,
  isFirebaseConfigured: false
}));

describe('DataExportService', () => {
  describe('validateImportData', () => {
    it('validates correct import data structure', () => {
      const validData: ExportData = {
        exportInfo: {
          exportedAt: '2025-01-03T00:00:00.000Z',
          exportedBy: 'test-user',
          version: '1.0',
          totalContainers: 1,
          totalItems: 1,
          totalTags: 1,
          totalCategories: 1
        },
        containers: [{
          id: 'container-1',
          name: 'Test Container',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date()
        }],
        items: [{
          id: 'item-1',
          name: 'Test Item',
          containerId: 'container-1',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date()
        }],
        tags: [{
          id: 'tag-1',
          name: 'Test Tag',
          color: '#ff0000',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date()
        }],
        categories: [{
          id: 'category-1',
          name: 'Test Category',
          path: 'Test Category',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      };

      const result = dataExportService.validateImportData(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects data missing export info', () => {
      const invalidData = {
        containers: [],
        items: [],
        tags: [],
        categories: []
      };

      const result = dataExportService.validateImportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing export information');
    });

    it('rejects data with invalid containers array', () => {
      const invalidData = {
        exportInfo: { exportedAt: '2025-01-03T00:00:00.000Z', exportedBy: 'test', version: '1.0', totalContainers: 0, totalItems: 0, totalTags: 0, totalCategories: 0 },
        containers: 'not-an-array',
        items: [],
        tags: [],
        categories: []
      };

      const result = dataExportService.validateImportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid or missing containers array');
    });

    it('validates required fields in containers', () => {
      const invalidData = {
        exportInfo: { exportedAt: '2025-01-03T00:00:00.000Z', exportedBy: 'test', version: '1.0', totalContainers: 1, totalItems: 0, totalTags: 0, totalCategories: 0 },
        containers: [{ id: 'test' }], // Missing name and userId
        items: [],
        tags: [],
        categories: []
      };

      const result = dataExportService.validateImportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Container at index 0 missing required fields (name, userId)');
    });

    it('validates required fields in items', () => {
      const invalidData = {
        exportInfo: { exportedAt: '2025-01-03T00:00:00.000Z', exportedBy: 'test', version: '1.0', totalContainers: 0, totalItems: 1, totalTags: 0, totalCategories: 0 },
        containers: [],
        items: [{ id: 'test' }], // Missing name, containerId, and userId
        tags: [],
        categories: []
      };

      const result = dataExportService.validateImportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item at index 0 missing required fields (name, containerId, userId)');
    });
  });

  describe('in demo mode', () => {
    it('throws error when trying to export', async () => {
      await expect(dataExportService.exportUserData()).rejects.toThrow('Firebase not configured');
    });

    it('throws error when trying to import', async () => {
      const mockData = {
        exportInfo: { exportedAt: '2025-01-03T00:00:00.000Z', exportedBy: 'test', version: '1.0', totalContainers: 0, totalItems: 0, totalTags: 0, totalCategories: 0 },
        containers: [],
        items: [],
        tags: [],
        categories: []
      } as ExportData;

      await expect(dataExportService.importData(mockData, 'user-1')).rejects.toThrow('Firebase not configured');
    });
  });

  describe('downloadExportData', () => {
    it('creates download link with correct filename', () => {
      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();
      
      const mockData = {
        exportInfo: { exportedAt: '2025-01-03T00:00:00.000Z', exportedBy: 'test', version: '1.0', totalContainers: 0, totalItems: 0, totalTags: 0, totalCategories: 0 },
        containers: [],
        items: [],
        tags: [],
        categories: []
      } as ExportData;

      dataExportService.downloadExportData(mockData, 'test-export.json');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test-export.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});