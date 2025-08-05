import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autenticación...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for URL parameters from OAuth redirect
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(getErrorMessage(error));
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setStatus('error');
            setMessage('Error al establecer la sesión. Intente nuevamente.');
            return;
          }

          setStatus('success');
          setMessage('¡Autenticación exitosa! Redirigiendo...');
          
          // Wait a moment then redirect
          setTimeout(() => {
            setLocation('/cuenta/panel');
          }, 2000);
        } else {
          // Try to get session from current session
          const { data, error: hashError } = await supabase.auth.getSession();
          
          if (hashError) {
            setStatus('error');
            setMessage('Error en la autenticación. Intente nuevamente.');
            return;
          }

          if (data.session) {
            setStatus('success');
            setMessage('¡Autenticación exitosa! Redirigiendo...');
            
            setTimeout(() => {
              setLocation('/cuenta/panel');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('No se pudo completar la autenticación.');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Error interno durante la autenticación.');
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'access_denied':
        return 'Acceso denegado. El usuario canceló la autenticación.';
      case 'server_error':
        return 'Error del servidor. Intente nuevamente más tarde.';
      case 'temporarily_unavailable':
        return 'Servicio temporalmente no disponible. Intente más tarde.';
      case 'invalid_request':
        return 'Solicitud inválida. Verifique la configuración.';
      case 'unsupported_response_type':
        return 'Tipo de respuesta no soportado.';
      default:
        return 'Error desconocido durante la autenticación.';
    }
  };

  const handleRetry = () => {
    setLocation('/login');
  };

  const handleHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <CardTitle className="text-xl">
            {status === 'loading' && 'Procesando...'}
            {status === 'success' && '¡Éxito!'}
            {status === 'error' && 'Error'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>

        {status === 'error' && (
          <CardContent className="space-y-3">
            <Button 
              onClick={handleRetry} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Intentar Nuevamente
            </Button>
            <Button 
              onClick={handleHome} 
              variant="outline" 
              className="w-full"
            >
              Ir al Inicio
            </Button>
          </CardContent>
        )}

        {status === 'loading' && (
          <CardContent>
            <div className="text-center text-sm text-gray-500">
              Por favor, espere mientras procesamos su autenticación...
            </div>
          </CardContent>
        )}

        {status === 'success' && (
          <CardContent>
            <div className="text-center text-sm text-gray-500">
              Será redirigido automáticamente en unos segundos.
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}