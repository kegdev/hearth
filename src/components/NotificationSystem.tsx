import { useState, createContext, useContext } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    showNotification({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    showNotification({ type: 'error', title, message, duration: 8000 }); // Longer for errors
  };

  const showWarning = (title: string, message?: string) => {
    showNotification({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    showNotification({ type: 'info', title, message });
  };

  const getToastVariant = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'light';
    }
  };

  const getToastIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            show={true}
            onClose={() => removeNotification(notification.id)}
            bg={getToastVariant(notification.type)}
            className={notification.type === 'error' || notification.type === 'warning' ? 'text-white' : ''}
          >
            <Toast.Header closeButton className={notification.type === 'error' || notification.type === 'warning' ? 'text-white' : ''}>
              <span className="me-2">{getToastIcon(notification.type)}</span>
              <strong className="me-auto">{notification.title}</strong>
            </Toast.Header>
            {(notification.message || notification.action) && (
              <Toast.Body>
                {notification.message && <p className="mb-2">{notification.message}</p>}
                {notification.action && (
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={() => {
                      notification.action!.onClick();
                      removeNotification(notification.id);
                    }}
                  >
                    {notification.action.label}
                  </button>
                )}
              </Toast.Body>
            )}
          </Toast>
        ))}
      </ToastContainer>
    </NotificationContext.Provider>
  );
};