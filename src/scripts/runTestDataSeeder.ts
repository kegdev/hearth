/**
 * Standalone Test Data Seeder Script
 * Run this to create test data directly
 */

import { seedTestData } from '../utils/testDataSeeder';

// Demo user ID for testing (you can replace this with your actual user ID)
const DEMO_USER_ID = 'demo-user-123';

/**
 * Run the test data seeder
 */
const runSeeder = async () => {
  try {
    console.log('🌱 Starting test data seeding...');
    console.log(`📋 User ID: ${DEMO_USER_ID}`);
    
    await seedTestData(DEMO_USER_ID);
    
    console.log('✅ Test data seeding completed successfully!');
    console.log('📦 Created: Kitchen Storage container with 8 sample items');
    console.log('🎯 You can now test the inventory features with realistic data');
    
  } catch (error) {
    console.error('❌ Error running test data seeder:', error);
    process.exit(1);
  }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
  runSeeder();
}

export { runSeeder };