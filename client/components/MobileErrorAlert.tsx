import React from 'react';

interface MobileErrorAlertProps {
  message: string;
  type?: 'error' | 'success' | 'warning';
  onClose?: () => void;
}

// Mobile-optimized error alert for SafraReport DR marketplace
export const MobileErrorAlert: React.FC<MobileErrorAlertProps> = ({ 
  message, 
  type = 'error', 
  onClose 
}) => {
  const getAlertStyles = () => {
    const baseStyles = "fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium text-sm sm:w-1/2 sm:mx-auto sm:left-auto sm:right-auto md:max-w-md lg:max-w-lg";
    
    switch (type) {
      case 'error':
        return `${baseStyles} bg-red-500 border-l-4 border-red-700`;
      case 'success':
        return `${baseStyles} bg-green-500 border-l-4 border-green-700`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 border-l-4 border-yellow-700 text-yellow-900`;
      default:
        return `${baseStyles} bg-red-500 border-l-4 border-red-700`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return '❌';
    }
  };

  return (
    <div className={getAlertStyles()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getIcon()}</span>
          <span>{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
            aria-label="Cerrar alerta"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Pre-configured error alerts for common SafraReport scenarios
export const StorageErrorAlert: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <MobileErrorAlert 
    message="Error al subir archivo. Intenta nuevamente." 
    type="error" 
    onClose={onClose} 
  />
);

export const DatabaseErrorAlert: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
  <MobileErrorAlert 
    message="Error de base de datos. Verifica tu conexión." 
    type="error" 
    onClose={onClose} 
  />
);

export const SuccessAlert: React.FC<{ message: string; onClose?: () => void }> = ({ message, onClose }) => (
  <MobileErrorAlert 
    message={message} 
    type="success" 
    onClose={onClose} 
  />
);

// Usage example for image upload with DOP formatting
export const ImageUploadAlert: React.FC<{ 
  isUploading: boolean; 
  error?: string; 
  success?: boolean;
  onClose?: () => void;
}> = ({ isUploading, error, success, onClose }) => {
  if (isUploading) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-blue-500 text-white font-medium text-sm sm:w-1/2 sm:mx-auto sm:left-auto sm:right-auto md:max-w-md lg:max-w-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Subiendo imagen...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <StorageErrorAlert onClose={onClose} />;
  }

  if (success) {
    return <SuccessAlert message="¡Imagen subida exitosamente!" onClose={onClose} />;
  }

  return null;
};
