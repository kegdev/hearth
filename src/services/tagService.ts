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
import type { Tag, CreateTagData } from '../types';

const COLLECTION_NAME = 'tags';

// Predefined tag colors
export const TAG_COLORS = [
  '#dc3545', // Red
  '#fd7e14', // Orange  
  '#ffc107', // Yellow
  '#198754', // Green
  '#20c997', // Teal
  '#0dcaf0', // Cyan
  '#0d6efd', // Blue
  '#6610f2', // Indigo
  '#6f42c1', // Purple
  '#d63384', // Pink
  '#6c757d', // Gray
  '#495057', // Dark Gray
];

export const createTag = async (
  userId: string,
  data: CreateTagData
): Promise<Tag> => {
  // If Firebase is not configured, return mock tag (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('🏷️ Demo mode: Tag created locally');
    const now = new Date();
    return {
      id: `demo_tag_${Date.now()}`,
      ...data,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  }

  try {
    const now = new Date();
    const tagData = {
      ...data,
      userId,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), tagData);
    
    return {
      id: docRef.id,
      ...data,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating tag:', error);
    throw new Error('Failed to create tag');
  }
};

export const getUserTags = async (userId: string): Promise<Tag[]> => {
  // If Firebase is not configured, return empty array (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('🏷️ Demo mode: No tags yet');
    return [];
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    const tags = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        color: data.color,
        userId: data.userId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
    
    // Sort by name alphabetically
    tags.sort((a, b) => a.name.localeCompare(b.name));
    
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw new Error('Unable to connect to your inventory. Please check your internet connection.');
  }
};

export const updateTag = async (
  tagId: string,
  data: Partial<CreateTagData>
): Promise<void> => {
  // If Firebase is not configured, just return (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('🏷️ Demo mode: Tag updated locally');
    return;
  }

  try {
    const tagRef = doc(db, COLLECTION_NAME, tagId);
    await updateDoc(tagRef, {
      ...data,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    throw new Error('Failed to update tag');
  }
};

export const deleteTag = async (tagId: string): Promise<void> => {
  // If Firebase is not configured, just return (demo mode)
  if (!isFirebaseConfigured || !db) {
    console.log('🏷️ Demo mode: Tag deleted locally');
    return;
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, tagId));
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw new Error('Failed to delete tag');
  }
};

// Auto-suggest tags based on item name
export const suggestTags = (itemName: string, _existingTags: Tag[]): string[] => {
  const name = itemName.toLowerCase();
  const suggestions: string[] = [];
  
  // Common tag suggestions based on keywords
  const tagSuggestions: Record<string, string[]> = {
    // Electronics
    'phone': ['Electronics', 'Mobile', 'Communication'],
    'laptop': ['Electronics', 'Computer', 'Work'],
    'tablet': ['Electronics', 'Mobile', 'Entertainment'],
    'camera': ['Electronics', 'Photography', 'Hobby'],
    'headphones': ['Electronics', 'Audio', 'Entertainment'],
    'charger': ['Electronics', 'Accessories', 'Power'],
    
    // Clothing
    'shirt': ['Clothing', 'Apparel', 'Fashion'],
    'pants': ['Clothing', 'Apparel', 'Fashion'],
    'jacket': ['Clothing', 'Outerwear', 'Fashion'],
    'shoes': ['Clothing', 'Footwear', 'Fashion'],
    'dress': ['Clothing', 'Formal', 'Fashion'],
    
    // Kitchen
    'pot': ['Kitchen', 'Cookware', 'Cooking'],
    'pan': ['Kitchen', 'Cookware', 'Cooking'],
    'knife': ['Kitchen', 'Utensils', 'Cooking'],
    'plate': ['Kitchen', 'Dinnerware', 'Dining'],
    'cup': ['Kitchen', 'Drinkware', 'Dining'],
    
    // Tools
    'hammer': ['Tools', 'Hardware', 'DIY'],
    'screwdriver': ['Tools', 'Hardware', 'DIY'],
    'drill': ['Tools', 'Power Tools', 'DIY'],
    'wrench': ['Tools', 'Hardware', 'DIY'],
    
    // Books & Media
    'book': ['Books', 'Reading', 'Education'],
    'magazine': ['Books', 'Reading', 'Entertainment'],
    'dvd': ['Media', 'Movies', 'Entertainment'],
    'cd': ['Media', 'Music', 'Entertainment'],
    
    // Sports & Fitness
    'ball': ['Sports', 'Recreation', 'Fitness'],
    'weights': ['Fitness', 'Exercise', 'Health'],
    'bike': ['Sports', 'Transportation', 'Fitness'],
    'helmet': ['Sports', 'Safety', 'Protection'],
  };
  
  // Find matching suggestions
  for (const [keyword, tags] of Object.entries(tagSuggestions)) {
    if (name.includes(keyword)) {
      suggestions.push(...tags);
    }
  }
  
  // Remove duplicates and limit to 5 suggestions
  return [...new Set(suggestions)].slice(0, 5);
};