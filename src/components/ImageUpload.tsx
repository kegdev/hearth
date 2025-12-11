import { useState, useEffect } from 'react';
import { Form, ProgressBar, Alert } from 'react-bootstrap';
import { getImageDimensions } from '../utils/imageUtils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
  disabled?: boolean;
}

const ImageUpload = ({ onImageSelect, currentImage, disabled }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [imageInfo, setImageInfo] = useState<string>('');
  const [compressionProgress, setCompressionProgress] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState(false);

  // Update preview when currentImage prop changes
  useEffect(() => {
    setPreview(currentImage || null);
    if (currentImage) {
      setImageInfo('Current image');
    } else {
      setImageInfo('');
    }
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setCompressionProgress(25);

      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      setCompressionProgress(50);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setCompressionProgress(75);

      // Set image info
      const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
      setImageInfo(`${dimensions.width}×${dimensions.height}px, ${sizeInMB}MB`);
      setCompressionProgress(100);

      // Pass file to parent
      onImageSelect(file);

      // Cleanup
      setTimeout(() => {
        setIsCompressing(false);
        setCompressionProgress(0);
      }, 500);

    } catch (error) {
      console.error('Error processing image:', error);
      setImageInfo('Error processing image');
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>Photo</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isCompressing}
        />
        <Form.Text className="text-muted">
          Images will be automatically compressed to under 1MB for storage
        </Form.Text>
      </Form.Group>

      {isCompressing && (
        <div className="mb-3">
          <small className="text-muted">Processing image...</small>
          <ProgressBar now={compressionProgress} className="mt-1" />
        </div>
      )}

      {imageInfo && !isCompressing && (
        <Alert variant="info" className="py-2">
          <small>{imageInfo}</small>
        </Alert>
      )}

      {preview && (
        <div className="mb-3">
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}
          />
          {currentImage && (
            <div className="mt-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => {
                  setPreview(null);
                  setImageInfo('');
                  // Create a fake file to indicate removal
                  const fakeFile = new File([''], 'remove-image', { type: 'image/remove' });
                  onImageSelect(fakeFile);
                }}
                disabled={disabled}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;