import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { shortUrlService } from '../services/shortUrlService';

const ShortUrlRedirectPage = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveShortUrl = async () => {
      if (!shortCode) {
        setError('Invalid short URL');
        setLoading(false);
        return;
      }

      try {
        const originalUrl = await shortUrlService.getOriginalUrl(shortCode);
        
        if (originalUrl) {
          setRedirectUrl(originalUrl);
        } else {
          setError('Short URL not found or expired');
        }
      } catch (err) {
        console.error('Error resolving short URL:', err);
        setError('Unable to resolve short URL');
      } finally {
        setLoading(false);
      }
    };

    resolveShortUrl();
  }, [shortCode]);

  // Redirect to resolved URL
  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace />;
  }

  // Loading state
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="text-muted">Resolving QR code...</p>
        </div>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>QR Code Not Found</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            This QR code may have expired, the item may have been deleted, or you may not have permission to access it. 
            Please check with the person who shared this code.
          </p>
        </Alert>
      </Container>
    );
  }

  return null;
};

export default ShortUrlRedirectPage;