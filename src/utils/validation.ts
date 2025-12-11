/**
 * Validation utilities for the Hearth app
 */

/**
 * Validates email format using a simple regex
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates item name
 */
export const validateItemName = (name: string): boolean => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
};

/**
 * Validates container name
 */
export const validateContainerName = (name: string): boolean => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // At least 8 characters, contains letters and numbers
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
};

/**
 * Validates tag name
 */
export const validateTagName = (name: string): boolean => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
};

/**
 * Validates category name
 */
export const validateCategoryName = (name: string): boolean => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
};

/**
 * Validates numeric values (prices, etc.)
 */
export const validateNumericValue = (value: number | string): boolean => {
  if (value === null || value === undefined || value === '') {
    return true; // Optional fields
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0;
};

/**
 * Validates file size for image uploads
 */
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  if (!file) {
    return false;
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validates image file type
 */
export const validateImageType = (file: File): boolean => {
  if (!file) {
    return false;
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
};