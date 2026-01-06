import { useState, useEffect } from 'react';
import { Toast, ToastContainer, Button } from 'react-bootstrap';

const PWAUpdatePrompt = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  // Mock PWA functionality for now - will be replaced with actual PWA hooks when deployed
  useEffect(() => {
    // Check if this is a PWA environment
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW Registered:', registration);
          setOfflineReady(true);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            setNeedRefresh(true);
            setShowUpdatePrompt(true);
          });
        })
        .catch((error) => {
          console.log('SW registration error:', error);
        });
    }
  }, []);

  const updateServiceWorker = (reloadPage?: boolean) => {
    if (reloadPage) {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (needRefresh) {
      setShowUpdatePrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setShowUpdatePrompt(false);
  };

  const handleClose = () => {
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
  };

  return (
    <>
      <ToastContainer position="bottom-end" className="p-3">
        {/* Update Available Toast */}
        <Toast 
          show={showUpdatePrompt} 
          onClose={handleClose}
          bg="primary"
          className="text-white"
        >
          <Toast.Header closeButton={false} className="bg-primary text-white border-0">
            <strong className="me-auto">🚀 Update Available</strong>
            <Button
              variant="link"
              size="sm"
              className="text-white p-0"
              onClick={handleClose}
            >
              ✕
            </Button>
          </Toast.Header>
          <Toast.Body>
            <p className="mb-2">A new version of Hearth is available!</p>
            <div className="d-flex gap-2">
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleUpdate}
              >
                Update Now
              </Button>
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={handleClose}
              >
                Later
              </Button>
            </div>
          </Toast.Body>
        </Toast>

        {/* Offline Ready Toast - Only show in development */}
        <Toast 
          show={offlineReady && import.meta.env.DEV} 
          onClose={() => setOfflineReady(false)}
          delay={3000}
          autohide
          bg="success"
          className="text-white"
        >
          <Toast.Body>
            <strong>📱 App ready to work offline!</strong>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default PWAUpdatePrompt;