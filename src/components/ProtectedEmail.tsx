import { useState } from 'react';
import { Button } from 'react-bootstrap';

interface ProtectedEmailProps {
  user: string;
  domain: string;
  subject?: string;
  className?: string;
  children?: React.ReactNode;
}

const ProtectedEmail = ({ user, domain, subject, className, children }: ProtectedEmailProps) => {
  const [revealed, setRevealed] = useState(false);
  
  const email = `${user}@${domain}`;
  const mailtoLink = subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
  
  // Obfuscated display for bots
  const obfuscatedEmail = `${user.replace(/./g, (char, index) => 
    index % 2 === 0 ? char : `&#${char.charCodeAt(0)};`
  )}&#64;${domain.replace(/\./g, '&#46;')}`;
  
  const handleReveal = () => {
    setRevealed(true);
  };
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };
  
  if (!revealed) {
    return (
      <div className={`d-flex align-items-center gap-2 ${className || ''}`}>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={handleReveal}
          title="Click to reveal email address"
        >
          📧 Show Email
        </Button>
        {children}
      </div>
    );
  }
  
  return (
    <div className={`d-flex align-items-center gap-2 ${className || ''}`}>
      <a 
        href={mailtoLink} 
        className="text-decoration-none"
        dangerouslySetInnerHTML={{ __html: obfuscatedEmail }}
      />
      <Button 
        variant="outline-secondary" 
        size="sm" 
        onClick={handleCopy}
        title="Copy email to clipboard"
      >
        📋
      </Button>
      {children}
    </div>
  );
};

export default ProtectedEmail;