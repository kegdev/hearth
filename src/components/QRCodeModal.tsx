import { Modal, Button } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { shortUrlService } from '../services/shortUrlService';

interface QRCodeModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  url: string;
  type?: 'container' | 'item';
  entityId?: string;
}

const QRCodeModal = ({ show, onHide, title, url, type = 'item', entityId }: QRCodeModalProps) => {
  const { user } = useAuthStore();
  const [shortUrl, setShortUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate short URL when modal opens
  useEffect(() => {
    const generateShortUrl = async () => {
      if (!show || !user || !entityId) return;

      setLoading(true);
      setError('');

      try {
        const shortCode = await shortUrlService.getOrCreateShortUrl(
          url,
          user.uid,
          type,
          entityId
        );
        
        const shortUrlPath = `${window.location.origin}/q/${shortCode}`;
        setShortUrl(shortUrlPath);
      } catch (err) {
        console.error('Error generating short URL:', err);
        setError('Unable to generate short URL');
        // Fallback to original URL
        setShortUrl(`${window.location.origin}${url}`);
      } finally {
        setLoading(false);
      }
    };

    generateShortUrl();
  }, [show, user, url, type, entityId]);

  // Use short URL if available, otherwise fallback to original
  const qrCodeUrl = shortUrl || `${window.location.origin}${url}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl);
      setCopySuccess(true);
      // Reset success message after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = qrCodeUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the QR code SVG element
    const qrElement = document.querySelector('.qr-code-container svg');
    if (!qrElement) return;

    // Create print-friendly HTML with just the QR code
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${title}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              text-align: center;
              background: white;
            }
            .qr-code {
              display: inline-block;
              margin: 0;
              padding: 0;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0;
              }
              .qr-code { 
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-code">${qrElement.outerHTML}</div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleSave = () => {
    // Get the QR code SVG element
    const qrElement = document.querySelector('.qr-code-container svg') as SVGElement;
    if (!qrElement) return;

    // Clone the SVG to avoid modifying the original
    const svgClone = qrElement.cloneNode(true) as SVGElement;
    
    // Set explicit dimensions for better quality
    svgClone.setAttribute('width', '400');
    svgClone.setAttribute('height', '400');
    
    // Convert SVG to string
    const svgData = new XMLSerializer().serializeToString(svgClone);
    
    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size for high quality
    canvas.width = 400;
    canvas.height = 400;
    
    // Create an image from the SVG
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Fill canvas with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the QR code
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `qr-code-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URLs
        URL.revokeObjectURL(downloadUrl);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    };
    
    img.src = url;
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>QR Code - {title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <div className="mb-3 qr-code-container">
          <QRCodeSVG
            value={qrCodeUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={true}
          />
        </div>
        {loading && (
          <p className="text-muted small">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Generating QR code...
          </p>
        )}
        {error && (
          <p className="text-warning small">
            ⚠️ {error}
          </p>
        )}
        <p className="text-muted small">
          Scan this QR code to quickly access this {type}
        </p>
        <div className="d-flex align-items-center justify-content-center gap-2">
          <code className="small flex-grow-1 text-center">{qrCodeUrl}</code>
          <Button 
            variant={copySuccess ? "success" : "outline-secondary"} 
            size="sm" 
            onClick={handleCopyUrl}
            className="ms-2"
          >
            {copySuccess ? "✅" : "📋"}
          </Button>
        </div>
        {copySuccess && (
          <p className="text-success small text-center mt-2 mb-0">
            URL copied to clipboard!
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleSave}>
          💾 Save as PNG
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          🖨️ Print QR Code
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QRCodeModal;