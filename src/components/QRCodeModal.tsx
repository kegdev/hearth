import { Modal, Button } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  url: string;
}

const QRCodeModal = ({ show, onHide, title, url }: QRCodeModalProps) => {
  const fullUrl = `${window.location.origin}${url}`;

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
            value={fullUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={true}
          />
        </div>
        <p className="text-muted small">
          Scan this QR code to quickly access this item
        </p>
        <code className="small">{fullUrl}</code>
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