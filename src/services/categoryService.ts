import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import type { Category, CreateCategoryData } from '../types';

const COLLECTION_NAME = 'categories';

// Predefined category templates
export const CATEGORY_TEMPLATES = [
  // Electronics
  { name: 'Electronics', children: [
    { name: 'Audio', children: ['Headphones', 'Speakers', 'Microphones'] },
    { name: 'Computing', children: ['Laptops', 'Tablets', 'Accessories'] },
    { name: 'Mobile', children: ['Phones', 'Cases', 'Chargers'] },
    { name: 'Gaming', children: ['Consoles', 'Controllers', 'Games'] },
  ]},
  
  // Clothing & Fashion
  { name: 'Clothing', children: [
    { name: 'Tops', children: ['Shirts', 'Blouses', 'Sweaters'] },
    { name: 'Bottoms', children: ['Pants', 'Skirts', 'Shorts'] },
    { name: 'Outerwear', children: ['Jackets', 'Coats', 'Hoodies'] },
    { name: 'Footwear', children: ['Sneakers', 'Boots', 'Sandals'] },
  ]},
  
  // Home & Kitchen
  { name: 'Home & Kitchen', children: [
    { name: 'Cookware', children: ['Pots', 'Pans', 'Bakeware'] },
    { name: 'Dinnerware', children: ['Plates', 'Bowls', 'Cups'] },
    { name: 'Appliances', children: ['Small Appliances', 'Large Appliances'] },
    { name: 'Decor', children: ['Art', 'Plants', 'Lighting'] },
  ]},
  
  // Tools & Hardware
  { name: 'Tools', children: [
    { name: 'Hand Tools', children: ['Screwdrivers', 'Hammers', 'Wrenches'] },
    { name: 'Power Tools', children: ['Drills', 'Saws', 'Sanders'] },
    { name: 'Hardware', children: ['Screws', 'Nails', 'Fasteners'] },
  ]},
  
  // Books & Media
  { name: 'Books & Media', children: [
    { name: 'Books', children: ['Fiction', 'Non-Fiction', 'Reference'] },
    { name: 'Movies', children: ['DVDs', 'Blu-rays', 'Digital'] },
    { name: 'Music', children: ['CDs', 'Vinyl', 'Digital'] },
  ]},
  
  // Sports & Recreation
  { name: 'Sports & Recreation', children: [
    { name: 'Fitness', children: ['Weights', 'Cardio Equipment', 'Yoga'] },
    { name: 'Outdoor', children: ['Camping', 'Hiking', 'Cycling'] },
    { name: 'Team Sports', children: ['Basketball', 'Soccer', 'Baseball'] },
  ]},
];

export const createCategory = async (
  userId: string,
  data: CreateCategoryData
): Promise<Category> => {
  // If Firebase is not configured, return mock category (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📂 Demo mode: Category created locally');
    const now = new Date();
    const path = data.parentId ? `Parent > ${data.name}` : data.name;
    return {
      id: `demo_category_${Date.now()}`,
      name: data.name,
      parentId: data.parentId,
      path,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  }

  try {
    const now = new Date();
    
    // Calculate the full path for hierarchical display
    let path = data.name;
    if (data.parentId) {
      // Get parent category to build path
      const parentCategories = await getUserCategories(userId);
      const parent = parentCategories.find(c => c.id === data.parentId);
      if (parent) {
        path = `${parent.path} > ${data.name}`;
      }
    }
    
    const categoryData = {
      name: data.name,
      parentId: data.parentId || null,
      path,
      userId,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), categoryData);
    
    return {
      id: docRef.id,
      name: data.name,
      parentId: data.parentId,
      path,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }
};

export const getUserCategories = async (userId: string): Promise<Category[]> => {
  // If Firebase is not configured, return empty array (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📂 Demo mode: No categories yet');
    return [];
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    const categories = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        parentId: data.parentId,
        path: data.path,
        userId: data.userId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
    
    // Sort by path for hierarchical display
    categories.sort((a, b) => a.path.localeCompare(b.path));
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Unable to connect to your inventory. Please check your internet connection.');
  }
};

export const updateCategory = async (
  categoryId: string,
  data: Partial<CreateCategoryData>
): Promise<void> => {
  // If Firebase is not configured, just return (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📂 Demo mode: Category updated locally');
    return;
  }

  try {
    const categoryRef = doc(db, COLLECTION_NAME, categoryId);
    await updateDoc(categoryRef, {
      ...data,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Failed to update category');
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  // If Firebase is not configured, just return (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('📂 Demo mode: Category deleted locally');
    return;
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, categoryId));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
};

// Get root categories (no parent)
export const getRootCategories = (categories: Category[]): Category[] => {
  return categories.filter(cat => !cat.parentId);
};

// Get child categories for a parent
export const getChildCategories = (categories: Category[], parentId: string): Category[] => {
  return categories.filter(cat => cat.parentId === parentId);
};

// Build category tree structure
export const buildCategoryTree = (categories: Category[]): any[] => {
  const rootCategories = getRootCategories(categories);
  
  const buildTree = (parentCategories: Category[]): any[] => {
    return parentCategories.map(category => ({
      ...category,
      children: buildTree(getChildCategories(categories, category.id))
    }));
  };
  
  return buildTree(rootCategories);
};

// Create categories from templates
export const createCategoriesFromTemplate = async (
  userId: string,
  templateName: string
): Promise<Category[]> => {
  const template = CATEGORY_TEMPLATES.find(t => t.name === templateName);
  if (!template) {
    throw new Error('Template not found');
  }
  
  const createdCategories: Category[] = [];
  
  try {
    // Create root category
    const rootCategory = await createCategory(userId, { name: template.name });
    createdCategories.push(rootCategory);
    
    // Create child categories
    for (const child of template.children) {
      if (typeof child === 'string') {
        const childCategory = await createCategory(userId, {
          name: child,
          parentId: rootCategory.id
        });
        createdCategories.push(childCategory);
      } else {
        const childCategory = await createCategory(userId, {
          name: child.name,
          parentId: rootCategory.id
        });
        createdCategories.push(childCategory);
        
        // Create grandchild categories
        for (const grandchild of child.children) {
          const grandchildCategory = await createCategory(userId, {
            name: grandchild,
            parentId: childCategory.id
          });
          createdCategories.push(grandchildCategory);
        }
      }
    }
    
    return createdCategories;
  } catch (error) {
    console.error('Error creating categories from template:', error);
    throw new Error('Failed to create categories from template');
  }
};