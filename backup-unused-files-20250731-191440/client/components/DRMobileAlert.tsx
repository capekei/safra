import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface DRMobileAlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
  showIcon?: boolean;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    iconColor: 'text-white',
    borderColor: 'border-green-600',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-500',
    textColor: 'text-white', 
    iconColor: 'text-white',
    borderColor: 'border-red-600',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-900',
    borderColor: 'border-yellow-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    iconColor: 'text-white',
    borderColor: 'border-blue-600',
  },
};

/**
 * Mobile-Optimized Alert Component for SafraReport Dominican Republic Marketplace
 * Provides Spanish-first error messages with DOP currency formatting support
 * 
 * Features:
 * - Mobile-first responsive design
 * - Dominican Spanish messages
 * - DOP currency formatting
 * - Liquidglass Light Frost effects
 * - Auto-close functionality
 * - Accessibility compliant
 */
export function DRMobileAlert({
  type = 'info',
  title,
  message,
  onClose,
  autoClose = false,
  duration = 5000,
  className,
  showIcon = true,
}: DRMobileAlertProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const config = alertConfig[type];
  const Icon = config.icon;

  // Auto-close functionality
  React.useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Allow fade-out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 left-4 right-4 z-50 mx-auto max-w-md',
        'sm:relative sm:top-0 sm:left-0 sm:right-0 sm:mx-0 sm:max-w-none',
        'transition-all duration-300 ease-in-out',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div
        className={cn(
          'rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-sm',
          'sm:rounded-xl sm:p-3',
          config.bgColor,
          config.borderColor,
          'relative overflow-hidden'
        )}
      >
        {/* Liquidglass Light Frost Effect */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-2xl sm:rounded-xl" />
        
        {/* Content Container */}
        <div className="relative flex items-start space-x-3">
          {/* Icon */}
          {showIcon && (
            <div className="flex-shrink-0 pt-0.5">
              <Icon 
                className={cn('h-6 w-6 sm:h-5 sm:w-5', config.iconColor)}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={cn(
                'text-lg font-semibold mb-1 sm:text-base sm:mb-0.5',
                config.textColor
              )}>
                {title}
              </h3>
            )}
            <p className={cn(
              'text-base leading-relaxed sm:text-sm sm:leading-normal',
              config.textColor
            )}>
              {message}
            </p>
          </div>

          {/* Close Button */}
          {onClose && (
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className={cn(
                  'rounded-full p-2 transition-colors duration-200',
                  'hover:bg-white/20 focus:bg-white/20',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  config.textColor
                )}
                aria-label="Cerrar alerta"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Auto-close progress bar */}
        {autoClose && duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white/60 origin-left transition-transform ease-linear"
              style={{
                animationName: 'progress',
                animationDuration: `${duration}ms`,
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards',
              }}
            />
          </div>
        )}
      </div>

      {/* Progress animation - moved to CSS or tailwind config */}
    </div>
  );
}

/**
 * Predefined Dominican Spanish Alert Messages
 */
export const DR_ALERT_MESSAGES = {
  // Database errors
  DATABASE_ERROR: 'Error de base de datos. Por favor, intenta de nuevo.',
  CONNECTION_ERROR: 'Error de conexión. Verifica tu internet.',
  
  // Form validation
  REQUIRED_FIELDS: 'Por favor, completa todos los campos requeridos.',
  INVALID_EMAIL: 'El correo electrónico no es válido.',
  INVALID_PHONE: 'El número de teléfono no es válido para República Dominicana.',
  INVALID_CEDULA: 'La cédula no es válida.',
  
  // Authentication
  LOGIN_SUCCESS: '¡Bienvenido a SafraReport!',
  LOGIN_ERROR: 'Error al iniciar sesión. Verifica tus credenciales.',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente.',
  REGISTRATION_SUCCESS: '¡Cuenta creada exitosamente!',
  
  // Commerce
  PRICE_FORMAT_ERROR: 'El precio debe estar en pesos dominicanos (DOP).',
  PAYMENT_SUCCESS: 'Pago procesado exitosamente.',
  PAYMENT_ERROR: 'Error al procesar el pago. Intenta de nuevo.',
  
  // File operations
  UPLOAD_SUCCESS: 'Archivo subido exitosamente.',
  UPLOAD_ERROR: 'Error al subir archivo. Verifica el formato.',
  DELETE_SUCCESS: 'Elemento eliminado exitosamente.',
  DELETE_ERROR: 'Error al eliminar elemento.',
  
  // General
  SUCCESS: '¡Operación exitosa!',
  ERROR: 'Ha ocurrido un error inesperado.',
  WARNING: 'Atención requerida.',
  INFO: 'Información importante.',
} as const;

/**
 * Helper function to format DOP currency in alerts
 */
export function formatDOPInAlert(amount: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Utility function to create success alerts
 */
export function showSuccessAlert(message: string, title?: string) {
  return (
    <DRMobileAlert
      type="success"
      title={title || 'Éxito'}
      message={message}
      autoClose
      duration={4000}
      showIcon
    />
  );
}

/**
 * Utility function to create error alerts
 */
export function showErrorAlert(message: string, title?: string) {
  return (
    <DRMobileAlert
      type="error"
      title={title || 'Error'}
      message={message}
      showIcon
    />
  );
}

/**
 * Utility function to create warning alerts
 */
export function showWarningAlert(message: string, title?: string) {
  return (
    <DRMobileAlert
      type="warning"
      title={title || 'Advertencia'}
      message={message}
      autoClose
      duration={6000}
      showIcon
    />
  );
}

/**
 * Utility function to create info alerts
 */
export function showInfoAlert(message: string, title?: string) {
  return (
    <DRMobileAlert
      type="info"
      title={title || 'Información'}
      message={message}
      autoClose
      duration={5000}
      showIcon
    />
  );
}

/**
 * Hook for managing alert state
 */
export function useDRAlert() {
  const [alert, setAlert] = React.useState<{
    type: AlertType;
    title?: string;
    message: string;
    id: string;
  } | null>(null);

  const showAlert = React.useCallback((
    type: AlertType,
    message: string,
    title?: string
  ) => {
    setAlert({
      type,
      title,
      message,
      id: Date.now().toString(),
    });
  }, []);

  const hideAlert = React.useCallback(() => {
    setAlert(null);
  }, []);

  const AlertComponent = alert ? (
    <DRMobileAlert
      key={alert.id}
      type={alert.type}
      title={alert.title}
      message={alert.message}
      onClose={hideAlert}
      autoClose={alert.type !== 'error'}
    />
  ) : null;

  return {
    alert: AlertComponent,
    showSuccess: (message: string, title?: string) => showAlert('success', message, title),
    showError: (message: string, title?: string) => showAlert('error', message, title),
    showWarning: (message: string, title?: string) => showAlert('warning', message, title),
    showInfo: (message: string, title?: string) => showAlert('info', message, title),
    hideAlert,
  };
}