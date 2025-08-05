import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component for SafraReport Dominican Republic Marketplace
 * Provides Spanish-first error messages with mobile-optimized UI
 */
export class DRErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for monitoring (production)
    console.error('DR Error Boundary caught an error:', error, errorInfo);
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with Sentry, LogRocket, etc.
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Dominican Republic specific error reporting
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      locale: 'es-DO', // Dominican Republic locale
    };

    // Send to monitoring service
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    }).catch(() => {
      // Silently fail if error reporting fails
      console.warn('Error al reportar error al servidor');
    });
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Dominican Republic themed error UI with Spanish messages
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Mobile-optimized error card with glass effect */}
            <div className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-2xl p-6 shadow-2xl">
              <div className="text-center">
                {/* Error icon with Dominican colors */}
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>

                {/* Spanish error title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Ups! Algo salió mal
                </h2>

                {/* Friendly Dominican Spanish message */}
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Ha ocurrido un error inesperado en SafraReport. 
                  No te preocupes, nuestro equipo ya está trabajando para solucionarlo.
                </p>

                {/* Mobile-friendly action buttons */}
                <div className="space-y-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span>Intentar de nuevo</span>
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>Ir al inicio</span>
                  </button>
                </div>

                {/* Development error details */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                      Detalles técnicos (desarrollo)
                    </summary>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-700 max-h-32 overflow-y-auto">
                      <div className="mb-2">
                        <strong>Error:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap mt-1">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {/* Dominican Republic branding */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    SafraReport • Marketplace Dominicano
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with Dominican Republic Error Boundary
 */
export function withDRErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <DRErrorBoundary fallback={fallback}>
        <Component {...props} />
      </DRErrorBoundary>
    );
  };
}

/**
 * Hook for programmatic error reporting
 */
export function useDRErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context: context || 'Manual Report',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      locale: 'es-DO',
    };

    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(() => {
        console.warn('Error al reportar error al servidor');
      });
    } else {
      console.error('DR Error Report:', errorData);
    }
  }, []);

  return { reportError };
}