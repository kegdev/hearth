export interface Container {
  id: string;
  name: string;
  description?: string;
  location?: string;
  imageUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string; // For hierarchical categories
  path: string; // Full path like "Electronics > Audio > Headphones"
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  containerId: string;
  imageUrl?: string;
  tags?: string[]; // Array of tag IDs
  categoryId?: string; // Single category ID
  // Advanced properties
  purchasePrice?: number;
  currentValue?: number;
  purchaseDate?: Date;
  condition?: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  warranty?: string; // Warranty information
  serialNumber?: string;
  model?: string;
  brand?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Approval System Types
export interface UserRegistrationRequest {
  id: string;
  email: string;
  displayName?: string;
  reason: string; // Why they want access
  status: 'pending' | 'approved' | 'denied';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // Admin user ID
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  status: 'pending' | 'approved' | 'denied' | 'admin';
  isAdmin?: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRegistrationRequestData {
  email: string;
  displayName?: string;
  reason: string;
}

export interface CreateContainerData {
  name: string;
  description?: string;
  location?: string;
  image?: File;
}

export interface CreateItemData {
  name: string;
  description?: string;
  containerId: string;
  image?: File;
  tags?: string[];
  categoryId?: string;
  // Advanced properties
  purchasePrice?: number;
  currentValue?: number;
  purchaseDate?: Date;
  condition?: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  warranty?: string;
  serialNumber?: string;
  model?: string;
  brand?: string;
}

export interface CreateTagData {
  name: string;
  color: string;
}

export interface CreateCategoryData {
  name: string;
  parentId?: string;
}