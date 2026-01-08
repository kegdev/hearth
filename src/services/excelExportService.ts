import * as XLSX from 'xlsx';
import type { Container, Item, Tag, Category } from '../types';
import type { ExportData } from './dataExportService';

export interface ExcelExportOptions {
  includeImages?: boolean;
  includeFinancials?: boolean;
  includeStatistics?: boolean;
}

class ExcelExportService {
  /**
   * Export data to Excel workbook with multiple sheets
   */
  async exportToExcel(
    exportData: ExportData, 
    options: ExcelExportOptions = {}
  ): Promise<void> {
    const { 
      includeImages = false, 
      includeFinancials = true, 
      includeStatistics = true 
    } = options;

    // Create new workbook
    const workbook = XLSX.utils.book_new();

    // Add summary sheet
    this.addSummarySheet(workbook, exportData, includeStatistics);

    // Add containers sheet
    this.addContainersSheet(workbook, exportData.containers, exportData.items);

    // Add items sheet
    this.addItemsSheet(workbook, exportData.items, exportData.containers, includeFinancials, includeImages);

    // Add tags sheet if tags exist
    if (exportData.tags && exportData.tags.length > 0) {
      this.addTagsSheet(workbook, exportData.tags, exportData.items);
    }

    // Add categories sheet if categories exist
    if (exportData.categories && exportData.categories.length > 0) {
      this.addCategoriesSheet(workbook, exportData.categories, exportData.items);
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `hearth-inventory-${timestamp}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  }

  private addSummarySheet(workbook: XLSX.WorkBook, exportData: ExportData, includeStats: boolean): void {
    const summaryData = [
      ['Hearth Inventory Export Summary'],
      [''],
      ['Export Information'],
      ['Exported At', new Date(exportData.exportInfo.exportedAt).toLocaleString()],
      ['Export Version', exportData.exportInfo.version],
      ['Exported By', exportData.exportInfo.exportedBy],
      [''],
      ['Inventory Overview'],
      ['Total Containers', exportData.exportInfo.totalContainers],
      ['Total Items', exportData.exportInfo.totalItems],
      ['Total Tags', exportData.exportInfo.totalTags],
      ['Total Categories', exportData.exportInfo.totalCategories],
    ];

    if (includeStats) {
      // Calculate additional statistics
      const totalValue = exportData.items.reduce((sum, item) => {
        return sum + (item.purchasePrice || 0);
      }, 0);

      const itemsWithWarranty = exportData.items.filter(item => 
        item.warranty && item.warranty.trim().length > 0
      ).length;

      const containerStats = this.calculateContainerStats(exportData.containers, exportData.items);

      summaryData.push(
        [''],
        ['Financial Summary'],
        ['Total Estimated Value', `$${totalValue.toFixed(2)}`],
        ['Items with Active Warranty', itemsWithWarranty],
        [''],
        ['Container Statistics'],
        ['Average Items per Container', containerStats.avgItemsPerContainer.toFixed(1)],
        ['Most Items in Container', containerStats.maxItemsInContainer],
        ['Empty Containers', containerStats.emptyContainers]
      );
    }

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 25 },
      { width: 20 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
  }

  private addContainersSheet(workbook: XLSX.WorkBook, containers: Container[], items: Item[]): void {
    // Calculate item counts and values for each container
    const containerStats = new Map<string, { count: number; value: number }>();
    
    items.forEach(item => {
      const stats = containerStats.get(item.containerId) || { count: 0, value: 0 };
      stats.count++;
      stats.value += item.purchasePrice || 0;
      containerStats.set(item.containerId, stats);
    });

    const headers = [
      'Container Name',
      'Location',
      'Description',
      'Item Count',
      'Total Value',
      'Created Date',
      'Last Updated'
    ];

    const rows = containers.map(container => {
      const stats = containerStats.get(container.id) || { count: 0, value: 0 };
      return [
        container.name,
        container.location || '',
        container.description || '',
        stats.count,
        `$${stats.value.toFixed(2)}`,
        new Date(container.createdAt).toLocaleDateString(),
        new Date(container.updatedAt).toLocaleDateString()
      ];
    });

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { width: 20 }, // Container Name
      { width: 15 }, // Location
      { width: 30 }, // Description
      { width: 12 }, // Item Count
      { width: 12 }, // Total Value
      { width: 12 }, // Created Date
      { width: 12 }  // Last Updated
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Containers');
  }

  private addItemsSheet(
    workbook: XLSX.WorkBook, 
    items: Item[], 
    containers: Container[], 
    includeFinancials: boolean,
    includeImages: boolean
  ): void {
    // Create container lookup map
    const containerMap = new Map(containers.map(c => [c.id, c.name]));

    const headers = [
      'Item Name',
      'Container',
      'Category ID',
      'Tags',
      'Quantity',
      'Description'
    ];

    if (includeFinancials) {
      headers.push('Purchase Price', 'Purchase Date', 'Warranty Info');
    }

    if (includeImages) {
      headers.push('Has Image');
    }

    headers.push('Created Date', 'Last Updated');

    const rows = items.map(item => {
      const row = [
        item.name,
        containerMap.get(item.containerId) || 'Unknown Container',
        item.categoryId || '',
        Array.isArray(item.tags) ? item.tags.join(', ') : '',
        1, // Default quantity since it's not in the interface
        item.description || ''
      ];

      if (includeFinancials) {
        row.push(
          item.purchasePrice ? `$${item.purchasePrice.toFixed(2)}` : '',
          item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '',
          item.warranty || ''
        );
      }

      if (includeImages) {
        row.push(item.imageUrl ? 'Yes' : 'No');
      }

      row.push(
        new Date(item.createdAt).toLocaleDateString(),
        new Date(item.updatedAt).toLocaleDateString()
      );

      return row;
    });

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const colWidths = [
      { width: 25 }, // Item Name
      { width: 20 }, // Container
      { width: 15 }, // Category
      { width: 20 }, // Tags
      { width: 10 }, // Quantity
      { width: 30 }  // Description
    ];

    if (includeFinancials) {
      colWidths.push(
        { width: 12 }, // Purchase Price
        { width: 12 }, // Purchase Date
        { width: 12 }  // Warranty Until
      );
    }

    if (includeImages) {
      colWidths.push({ width: 10 }); // Has Image
    }

    colWidths.push(
      { width: 12 }, // Created Date
      { width: 12 }  // Last Updated
    );

    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');
  }

  private addTagsSheet(workbook: XLSX.WorkBook, tags: Tag[], items: Item[]): void {
    // Calculate tag usage statistics
    const tagUsage = new Map<string, number>();
    
    items.forEach(item => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tagId => {
          tagUsage.set(tagId, (tagUsage.get(tagId) || 0) + 1);
        });
      }
    });

    const headers = [
      'Tag Name',
      'Color',
      'Usage Count',
      'Created Date'
    ];

    const rows = tags.map(tag => [
      tag.name,
      tag.color || '',
      tagUsage.get(tag.id) || 0,
      new Date(tag.createdAt).toLocaleDateString()
    ]);

    // Sort by usage count (descending)
    rows.sort((a, b) => (b[2] as number) - (a[2] as number));

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { width: 20 }, // Tag Name
      { width: 10 }, // Color
      { width: 12 }, // Usage Count
      { width: 12 }  // Created Date
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tags');
  }

  private addCategoriesSheet(workbook: XLSX.WorkBook, categories: Category[], items: Item[]): void {
    // Calculate category usage statistics
    const categoryUsage = new Map<string, number>();
    
    items.forEach(item => {
      if (item.categoryId) {
        categoryUsage.set(item.categoryId, (categoryUsage.get(item.categoryId) || 0) + 1);
      }
    });

    const headers = [
      'Category Name',
      'Usage Count',
      'Created Date'
    ];

    const rows = categories.map(category => [
      category.name,
      categoryUsage.get(category.id) || 0,
      new Date(category.createdAt).toLocaleDateString()
    ]);

    // Sort by usage count (descending)
    rows.sort((a, b) => (b[1] as number) - (a[1] as number));

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { width: 20 }, // Category Name
      { width: 12 }, // Usage Count
      { width: 12 }  // Created Date
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
  }

  private calculateContainerStats(containers: Container[], items: Item[]) {
    const containerItemCounts = new Map<string, number>();
    
    // Count items per container
    items.forEach(item => {
      containerItemCounts.set(
        item.containerId, 
        (containerItemCounts.get(item.containerId) || 0) + 1
      );
    });

    const itemCounts = Array.from(containerItemCounts.values());
    const emptyContainers = containers.length - containerItemCounts.size;
    
    return {
      avgItemsPerContainer: itemCounts.length > 0 
        ? itemCounts.reduce((sum, count) => sum + count, 0) / itemCounts.length 
        : 0,
      maxItemsInContainer: itemCounts.length > 0 ? Math.max(...itemCounts) : 0,
      emptyContainers
    };
  }
}

export const excelExportService = new ExcelExportService();