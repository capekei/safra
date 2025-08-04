import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ 
      error, 
      errorInfo 
    });

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Production Error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });

      // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      ¡Oops! Algo salió mal
                    </h3>
                    <p className="text-sm text-red-700">
                      Ocurrió un error inesperado en SafraReport. Nuestro equipo ha sido notificado 
                      y está trabajando para solucionarlo.
                    </p>
                  </div>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="text-xs bg-red-100 p-2 rounded border">
                      <summary className="cursor-pointer font-medium">
                        Detalles del error (desarrollo)
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap text-red-800 overflow-auto">
                        {this.state.error.message}
                        {'\n\n'}
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={this.handleReload}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Recargar página
                    </Button>
                    <Button 
                      onClick={this.handleGoHome}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <Home className="w-4 h-4 mr-1" />
                      Ir al inicio
                    </Button>
                  </div>

                  <div className="text-xs text-red-600 pt-2">
                    <p>
                      Si el problema persiste, contáctanos en{' '}
                      <a 
                        href="mailto:soporte@safrareport.com" 
                        className="underline hover:no-underline"
                      >
                        soporte@safrareport.com
                      </a>
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping pages
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ProductionErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ProductionErrorBoundary>
    );
  };
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = (error: Error, context?: string) => {
    if (process.env.NODE_ENV === 'production') {
      console.error('Manual Error Report:', {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
      // TODO: Send to monitoring service
    }
  };

  return { reportError };
}