import { Alert, Container } from 'react-bootstrap';
import { isFirebaseConfigured } from '../firebase/config';

const DemoModeIndicator = () => {
  if (isFirebaseConfigured) {
    return null; // Don't show anything if Firebase is properly configured
  }

  return (
    <Container className="mt-2">
      <Alert variant="info" className="mb-0 text-center">
        <small>
          🔧 <strong>Demo Mode</strong> - You're exploring Hearth! 
          Data won't be saved until Firebase is configured. 
          <a 
            href="https://github.com/your-repo/hearth#setup" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ms-1"
          >
            Setup Guide
          </a>
        </small>
      </Alert>
    </Container>
  );
};

export default DemoModeIndicator;