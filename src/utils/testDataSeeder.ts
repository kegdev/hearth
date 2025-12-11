/**
 * Test Data Seeder
 * Creates random sample containers and items for testing purposes
 */

import { createContainer } from '../services/containerService';
import { createItem, getUserItems } from '../services/itemService';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import type { CreateContainerData, CreateItemData } from '../types';

// Random data pools
const containerNames = [
  'Kitchen Storage', 'Bedroom Closet', 'Garage Toolbox', 'Office Supplies', 'Bathroom Cabinet',
  'Living Room Entertainment', 'Basement Storage', 'Attic Box', 'Pantry Shelf', 'Craft Room',
  'Workshop Cabinet', 'Laundry Room', 'Guest Room Dresser', 'Study Bookshelf', 'Outdoor Shed'
];

const containerLocations = [
  'Kitchen Counter', 'Master Bedroom', 'Garage Wall', 'Home Office', 'Main Bathroom',
  'Living Room TV Stand', 'Basement Corner', 'Attic Storage', 'Pantry Top Shelf', 'Craft Table',
  'Workshop Bench', 'Laundry Area', 'Guest Closet', 'Study Desk', 'Backyard Shed'
];

const itemCategories = {
  kitchen: {
    items: [
      'Stand Mixer', 'Blender', 'Food Processor', 'Coffee Maker', 'Toaster', 'Air Fryer',
      'Slow Cooker', 'Rice Cooker', 'Pressure Cooker', 'Hand Mixer', 'Juicer', 'Waffle Maker'
    ],
    brands: ['KitchenAid', 'Ninja', 'Cuisinart', 'Breville', 'Hamilton Beach', 'Instant Pot'],
    tags: ['appliance', 'kitchen', 'cooking', 'baking']
  },
  tools: {
    items: [
      'Drill Set', 'Hammer', 'Screwdriver Set', 'Wrench Set', 'Pliers', 'Level',
      'Tape Measure', 'Socket Set', 'Allen Keys', 'Wire Cutters', 'Utility Knife', 'Saw'
    ],
    brands: ['DeWalt', 'Milwaukee', 'Craftsman', 'Stanley', 'Bosch', 'Makita'],
    tags: ['tools', 'hardware', 'workshop', 'repair']
  },
  electronics: {
    items: [
      'Bluetooth Speaker', 'Headphones', 'Tablet', 'Smart Watch', 'Phone Charger', 'Power Bank',
      'Webcam', 'Keyboard', 'Mouse', 'Monitor', 'Router', 'USB Hub'
    ],
    brands: ['Apple', 'Samsung', 'Sony', 'Logitech', 'Anker', 'JBL'],
    tags: ['electronics', 'tech', 'gadgets', 'digital']
  },
  clothing: {
    items: [
      'Winter Jacket', 'Running Shoes', 'Dress Shirt', 'Jeans', 'Sweater', 'T-Shirt',
      'Sneakers', 'Belt', 'Scarf', 'Hat', 'Gloves', 'Socks'
    ],
    brands: ['Nike', 'Adidas', 'Levi\'s', 'Gap', 'H&M', 'Uniqlo'],
    tags: ['clothing', 'apparel', 'fashion', 'wear']
  },
  books: {
    items: [
      'Programming Guide', 'Cookbook', 'Novel', 'Biography', 'History Book', 'Art Book',
      'Science Textbook', 'Travel Guide', 'Self-Help Book', 'Dictionary', 'Atlas', 'Manual'
    ],
    brands: ['Penguin', 'Random House', 'McGraw-Hill', 'O\'Reilly', 'National Geographic', 'Lonely Planet'],
    tags: ['books', 'reading', 'education', 'reference']
  }
};

const conditions: ('new' | 'excellent' | 'good' | 'fair')[] = ['new', 'excellent', 'good', 'fair'];

// Create simple SVG images programmatically to ensure they're valid
const createSampleImage = (color: string, text: string): string => {
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="${color}"/>
    <text x="50" y="55" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">${text}</text>
  </svg>`;
  
  // Properly encode to base64
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Sample images (created programmatically to ensure validity)
const sampleImages = {
  kitchen: createSampleImage('#4f8ef7', 'KITCHEN'),
  tools: createSampleImage('#34984c', 'TOOLS'),
  electronics: createSampleImage('#661fff', 'TECH'),
  clothing: createSampleImage('#ff6394', 'CLOTHES'),
  books: createSampleImage('#ff9500', 'BOOKS'),
  default: createSampleImage('#6c757d', 'ITEM')
};

// Utility functions
const randomChoice = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const randomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPrice = (min: number, max: number): number => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const randomDate = (startYear: number = 2020): Date => {
  const start = new Date(startYear, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generate a random container
 */
const generateRandomContainer = (): CreateContainerData => {
  const name = randomChoice(containerNames);
  const location = randomChoice(containerLocations);
  
  return {
    name,
    description: `${name} containing various items organized for easy access`,
    location
  };
};

/**
 * Generate a random item for a given category
 */
const generateRandomItem = (category: keyof typeof itemCategories): Omit<CreateItemData, 'containerId'> => {
  const categoryData = itemCategories[category];
  const itemName = randomChoice(categoryData.items);
  const brand = randomChoice(categoryData.brands);
  const condition = randomChoice(conditions);
  const purchasePrice = randomPrice(10, 500);
  const currentValue = purchasePrice * (condition === 'new' ? 1 : condition === 'excellent' ? 0.85 : condition === 'good' ? 0.65 : 0.45);
  const purchaseDate = randomDate(2020);
  
  return {
    name: `${brand} ${itemName}`,
    description: `High-quality ${itemName.toLowerCase()} from ${brand} with excellent features and reliability`,
    brand,
    model: `${brand.substring(0, 2).toUpperCase()}${randomNumber(1000, 9999)}`,
    condition,
    purchasePrice,
    currentValue: Math.round(currentValue * 100) / 100,
    purchaseDate,
    warranty: condition === 'new' ? `${randomNumber(1, 3)} year manufacturer warranty` : 
              condition === 'excellent' ? 'Limited warranty remaining' : 'Warranty expired',
    serialNumber: `${brand.substring(0, 2).toUpperCase()}${new Date().getFullYear()}${randomNumber(100000, 999999)}`,
    tags: [...categoryData.tags, category]
  };
};

/**
 * Create random test data with specified number of containers and items
 */
export const seedTestData = async (
  userId: string, 
  containerCount: number = 1, 
  itemsPerContainer: number = 8
): Promise<void> => {
  try {
    console.log('🌱 Seeding random test data...');
    console.log(`📦 Creating ${containerCount} container(s) with ${itemsPerContainer} items each`);

    const categories = Object.keys(itemCategories) as (keyof typeof itemCategories)[];
    let totalItemsCreated = 0;

    for (let i = 0; i < containerCount; i++) {
      // Create random container
      const containerData = generateRandomContainer();
      const container = await createContainer(userId, containerData);
      console.log(`📦 Created container ${i + 1}:`, container.name);

      // Create random items for this container
      for (let j = 0; j < itemsPerContainer; j++) {
        const randomCategory = randomChoice(categories);
        const itemData = generateRandomItem(randomCategory);
        
        const fullItemData: CreateItemData = {
          ...itemData,
          containerId: container.id
        };
        
        const item = await createItem(userId, fullItemData);
        console.log(`📋 Created item ${j + 1}:`, item.name);
        totalItemsCreated++;
      }
    }

    console.log('✅ Random test data seeding completed successfully!');
    console.log(`📦 Created ${containerCount} container(s) with ${totalItemsCreated} total items`);
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
};

/**
 * Create a single random container with random items
 */
export const seedSingleContainer = async (userId: string, itemCount: number = 5): Promise<void> => {
  return seedTestData(userId, 1, itemCount);
};

/**
 * Create multiple containers with fewer items each
 */
export const seedMultipleContainers = async (userId: string, containerCount: number = 3): Promise<void> => {
  return seedTestData(userId, containerCount, randomNumber(3, 8));
};

/**
 * Detect category from item tags or name
 */
const detectItemCategory = (item: any): keyof typeof sampleImages => {
  const tags = item.tags || [];
  const name = item.name?.toLowerCase() || '';
  
  // Check tags first
  for (const tag of tags) {
    if (tag in sampleImages) {
      return tag as keyof typeof sampleImages;
    }
  }
  
  // Check name for category keywords
  if (name.includes('kitchen') || name.includes('cook') || name.includes('mixer') || name.includes('blender')) {
    return 'kitchen';
  }
  if (name.includes('tool') || name.includes('drill') || name.includes('hammer') || name.includes('wrench')) {
    return 'tools';
  }
  if (name.includes('phone') || name.includes('tablet') || name.includes('speaker') || name.includes('electronic')) {
    return 'electronics';
  }
  if (name.includes('shirt') || name.includes('jacket') || name.includes('shoes') || name.includes('clothing')) {
    return 'clothing';
  }
  if (name.includes('book') || name.includes('guide') || name.includes('manual') || name.includes('novel')) {
    return 'books';
  }
  
  return 'default';
};

/**
 * Validate if an image URL is valid by actually testing if it loads
 */
const isValidImageUrl = (imageUrl: string | null | undefined): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve(false);
      return;
    }
    
    // For data URLs, try to load them
    if (imageUrl.startsWith('data:image/')) {
      const img = new Image();
      
      img.onload = () => {
        resolve(true);
      };
      
      img.onerror = () => {
        resolve(false);
      };
      
      // Set a timeout in case the image never loads or errors
      setTimeout(() => {
        resolve(false);
      }, 5000);
      
      try {
        img.src = imageUrl;
      } catch (error) {
        resolve(false);
      }
      return;
    }
    
    // For HTTP/HTTPS URLs, check if they're valid URLs first
    try {
      const url = new URL(imageUrl);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        // Try to load the image
        const img = new Image();
        
        img.onload = () => {
          resolve(true);
        };
        
        img.onerror = () => {
          resolve(false);
        };
        
        // Set a timeout for network images
        setTimeout(() => {
          resolve(false);
        }, 10000);
        
        img.src = imageUrl;
      } else {
        resolve(false);
      }
    } catch (error) {
      resolve(false);
    }
  });
};

/**
 * Remove broken images from existing items
 */
export const removeBrokenImages = async (userId: string): Promise<void> => {
  try {
    console.log('🔍 Checking for broken images...');
    
    // Get all user items
    const items = await getUserItems(userId);
    
    // Filter items with potentially broken images
    const itemsWithImages = items.filter(item => item.imageUrl);
    
    if (itemsWithImages.length === 0) {
      console.log('✅ No items with images found');
      return;
    }
    
    console.log(`📋 Found ${itemsWithImages.length} items with images, validating...`);
    
    let brokenCount = 0;
    
    // Check each item's image and remove if broken
    for (const item of itemsWithImages) {
      console.log(`🔍 Testing image for: ${item.name}`);
      
      const isValid = await isValidImageUrl(item.imageUrl);
      
      if (!isValid) {
        try {
          // Remove the broken image by setting imageUrl to null
          if (isFirebaseConfigured && db) {
            const itemRef = doc(db, 'items', item.id);
            await updateDoc(itemRef, {
              imageUrl: null,
              updatedAt: Timestamp.fromDate(new Date())
            });
          }
          
          console.log(`🗑️ Removed broken image from: ${item.name}`);
          brokenCount++;
        } catch (error) {
          console.error(`❌ Failed to remove broken image from ${item.name}:`, error);
        }
      } else {
        console.log(`✅ Image valid for: ${item.name}`);
      }
    }
    
    if (brokenCount === 0) {
      console.log('✅ No broken images found!');
    } else {
      console.log(`✅ Removed ${brokenCount} broken images`);
    }
    
  } catch (error) {
    console.error('❌ Error checking for broken images:', error);
    throw error;
  }
};

/**
 * Update existing items without images to add sample images
 */
export const addSampleImagesToExistingItems = async (userId: string): Promise<void> => {
  try {
    console.log('🖼️ Adding sample images to existing items...');
    
    // Get all user items
    const items = await getUserItems(userId);
    
    // Filter items without images
    const itemsWithoutImages = items.filter(item => !item.imageUrl);
    
    if (itemsWithoutImages.length === 0) {
      console.log('✅ All items already have images!');
      return;
    }
    
    console.log(`📋 Found ${itemsWithoutImages.length} items without images`);
    
    // Update each item with a sample image
    for (const item of itemsWithoutImages) {
      const category = detectItemCategory(item);
      const imageUrl = sampleImages[category];
      
      try {
        // Update the item document directly in Firestore
        if (isFirebaseConfigured && db) {
          const itemRef = doc(db, 'items', item.id);
          await updateDoc(itemRef, {
            imageUrl,
            updatedAt: Timestamp.fromDate(new Date())
          });
        }
        
        console.log(`🖼️ Added ${category} image to: ${item.name}`);
      } catch (error) {
        console.error(`❌ Failed to update item ${item.name}:`, error);
      }
    }
    
    console.log('✅ Sample images added to existing items!');
    
  } catch (error) {
    console.error('❌ Error adding sample images:', error);
    throw error;
  }
};

/**
 * Test a single image URL to see if it's valid (for debugging)
 */
export const testImageUrl = async (imageUrl: string): Promise<void> => {
  console.log(`🔍 Testing image URL: ${imageUrl.substring(0, 50)}...`);
  
  const isValid = await isValidImageUrl(imageUrl);
  
  if (isValid) {
    console.log('✅ Image is valid and loads successfully');
  } else {
    console.log('❌ Image is broken or failed to load');
  }
};

/**
 * Check if any test data exists (containers with items)
 */
export const hasTestData = (containers: any[]): boolean => {
  return containers.length > 0;
};