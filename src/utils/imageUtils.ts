import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  // Detect WebP support
  const supportsWebP = await checkWebPSupport();
  
  const defaultOptions = {
    maxSizeMB: 0.8, // 800KB target
    maxWidthOrHeight: 1024, // Max 1024px width/height
    useWebWorker: true,
    fileType: supportsWebP ? 'image/webp' : 'image/jpeg', // Use WebP if supported
    quality: supportsWebP ? 0.85 : 0.8, // Slightly higher quality for WebP
    ...options,
  };

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    
    // Log compression results
    const originalSize = (file.size / 1024 / 1024).toFixed(2);
    const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
    const format = supportsWebP ? 'WebP' : 'JPEG';
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📸 Image compressed (${format}): ${originalSize}MB → ${compressedSize}MB`);
    }
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

// Check WebP support
const checkWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const compressAndConvertToBase64 = async (
  file: File,
  options?: CompressionOptions
): Promise<string> => {
  const compressedFile = await compressImage(file, options);
  return convertToBase64(compressedFile);
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};