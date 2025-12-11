/**
 * Test Data Seeder
 * Creates sample container and items for testing purposes
 */

import { createContainer } from '../services/containerService';
import { createItem } from '../services/itemService';
import type { CreateContainerData, CreateItemData } from '../types';

/**
 * Create a test container with sample items
 */
export const seedTestData = async (userId: string): Promise<void> => {
  try {
    console.log('🌱 Seeding test data...');

    // Create test container
    const containerData: CreateContainerData = {
      name: 'Kitchen Storage',
      description: 'Main kitchen storage container with various appliances and utensils',
      location: 'Kitchen Counter'
    };

    const container = await createContainer(userId, containerData);
    console.log('📦 Created test container:', container.name);

    // Test items data
    const testItems: Omit<CreateItemData, 'containerId'>[] = [
      {
        name: 'KitchenAid Stand Mixer',
        description: 'Professional 6-quart stand mixer with dough hook, whisk, and paddle attachments',
        brand: 'KitchenAid',
        model: 'KSM6573CER',
        condition: 'excellent',
        purchasePrice: 399.99,
        currentValue: 350.00,
        purchaseDate: new Date('2023-01-15'),
        warranty: '1 year manufacturer warranty',
        serialNumber: 'KA2023001234',
        tags: ['appliance', 'baking', 'kitchen']
      },
      {
        name: 'Ninja Blender',
        description: 'High-speed blender with multiple speed settings and pulse function',
        brand: 'Ninja',
        model: 'BL610',
        condition: 'good',
        purchasePrice: 89.99,
        currentValue: 65.00,
        purchaseDate: new Date('2022-08-20'),
        warranty: 'Expired',
        serialNumber: 'NJ2022005678',
        tags: ['appliance', 'smoothies', 'kitchen']
      },
      {
        name: 'Cast Iron Skillet Set',
        description: 'Pre-seasoned cast iron skillet set with 8", 10", and 12" pans',
        brand: 'Lodge',
        model: 'L8SK3',
        condition: 'excellent',
        purchasePrice: 79.99,
        currentValue: 75.00,
        purchaseDate: new Date('2023-03-10'),
        warranty: 'Lifetime warranty',
        tags: ['cookware', 'cast-iron', 'kitchen']
      },
      {
        name: 'Instant Pot Pressure Cooker',
        description: '8-quart multi-use pressure cooker with 7-in-1 functionality',
        brand: 'Instant Pot',
        model: 'DUO80',
        condition: 'good',
        purchasePrice: 119.99,
        currentValue: 85.00,
        purchaseDate: new Date('2022-11-25'),
        warranty: '1 year manufacturer warranty',
        serialNumber: 'IP2022009876',
        tags: ['appliance', 'pressure-cooker', 'kitchen']
      },
      {
        name: 'Wooden Cutting Board Set',
        description: 'Bamboo cutting board set with 3 different sizes and juice grooves',
        brand: 'Bambüsi',
        condition: 'excellent',
        purchasePrice: 34.99,
        currentValue: 30.00,
        purchaseDate: new Date('2023-05-12'),
        tags: ['cutting-board', 'bamboo', 'kitchen']
      },
      {
        name: 'Stainless Steel Knife Set',
        description: '15-piece professional knife set with wooden block and sharpening steel',
        brand: 'Wüsthof',
        model: 'Classic 15-piece',
        condition: 'excellent',
        purchasePrice: 299.99,
        currentValue: 275.00,
        purchaseDate: new Date('2023-02-28'),
        warranty: 'Lifetime warranty',
        tags: ['knives', 'stainless-steel', 'kitchen']
      },
      {
        name: 'Digital Kitchen Scale',
        description: 'Precision digital scale with tare function and multiple unit measurements',
        brand: 'OXO',
        model: 'Good Grips 11lb',
        condition: 'good',
        purchasePrice: 49.99,
        currentValue: 35.00,
        purchaseDate: new Date('2022-12-05'),
        warranty: '2 year manufacturer warranty',
        serialNumber: 'OXO2022001122',
        tags: ['scale', 'digital', 'kitchen', 'baking']
      },
      {
        name: 'Silicone Spatula Set',
        description: 'Heat-resistant silicone spatula set with ergonomic handles in multiple colors',
        brand: 'OXO',
        condition: 'new',
        purchasePrice: 24.99,
        currentValue: 24.99,
        purchaseDate: new Date('2023-06-01'),
        tags: ['utensils', 'silicone', 'kitchen', 'baking']
      }
    ];

    // Create all test items
    for (const itemData of testItems) {
      const fullItemData: CreateItemData = {
        ...itemData,
        containerId: container.id
      };
      
      const item = await createItem(userId, fullItemData);
      console.log('📋 Created test item:', item.name);
    }

    console.log('✅ Test data seeding completed successfully!');
    console.log(`📦 Created 1 container with ${testItems.length} items`);
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
};

/**
 * Check if test data already exists
 */
export const hasTestData = (containers: any[]): boolean => {
  return containers.some(container => container.name === 'Kitchen Storage');
};