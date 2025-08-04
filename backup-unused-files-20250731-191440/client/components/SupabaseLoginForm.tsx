import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

interface SupabaseLoginFormProps {
  onSuccess?: () => void;
  showSignUp?: boolean;
  isAdmin?: boolean;
}

export function SupabaseLoginForm({ onSuccess, showSignUp = false, isAdmin = false }: SupabaseLoginFormProps) {
  const [isLogin, setIsLogin] = useState(!showSignUp);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        const error = result.success ? null : { message: result.error };
        if (error) {
          setError(error.message === 'Invalid login credentials' 
            ? 'Credenciales inválidas. Verifique su email y contraseña.' 
            : 'Error al iniciar sesión. Intente nuevamente.');
        } else {
          setSuccess('¡Inicio de sesión exitoso!');
          onSuccess?.();
        }
      } else {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError('Por favor, complete todos los campos requeridos.');
          return;
        }

        // signUp not available in current auth hook
        const error = { message: 'Registro no disponible actualmente' };
        
        if (error) {
          setError('Registro no disponible actualmente');
        } else {
          setSuccess('¡Cuenta creada exitosamente! Revise su email para confirmar su cuenta.');
          setFormData({ email: '', password: '', firstName: '', lastName: '' });
        }
      }
    } catch (err) {
      setError('Error interno del servidor. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError('Por favor, ingrese su email para recuperar la contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // resetPassword not available in current auth hook
      const error = { message: 'Recuperación de contraseña no disponible actualmente' };
      if (error) {
        setError('Error al enviar el correo de recuperación.');
      } else {
        setSuccess('Se ha enviado un correo de recuperación a su dirección de email.');
      }
    } catch (err) {
      setError('Error interno del servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'github') => {
    try {
      // signInWithOAuth not available in current auth hook
      const error = { message: 'OAuth no disponible actualmente' };
      if (error) {
        setError(`Error al iniciar sesión con ${provider}.`);
      }
    } catch (err) {
      setError('Error interno del servidor.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {isAdmin 
            ? 'Panel de Administración' 
            : isLogin 
              ? 'Iniciar Sesión' 
              : 'Crear Cuenta'
          }
        </CardTitle>
        <CardDescription className="text-center">
          {isAdmin 
            ? 'Acceso exclusivo para administradores'
            : isLogin 
              ? 'Ingrese a su cuenta de SafraReport' 
              : 'Únase a la comunidad de SafraReport'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Tu apellido"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isLogin ? 'Tu contraseña' : 'Mínimo 8 caracteres'}
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10"
                minLength={isLogin ? 1 : 8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading 
              ? (isLogin ? 'Iniciando sesión...' : 'Creando cuenta...') 
              : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')
            }
          </Button>
        </form>

        {isLogin && (
          <div className="text-center">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sm text-green-600 hover:text-green-700 hover:underline"
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        {!isAdmin && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
                className="text-xs"
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('facebook')}
                disabled={loading}
                className="text-xs"
              >
                Facebook
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('github')}
                disabled={loading}
                className="text-xs"
              >
                GitHub
              </Button>
            </div>

            <div className="text-center text-sm">
              {isLogin ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-green-600 hover:text-green-700 hover:underline font-medium"
                  >
                    Crear cuenta
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-green-600 hover:text-green-700 hover:underline font-medium"
                  >
                    Iniciar sesión
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {!isAdmin && (
          <div className="text-center">
            <Link href="/">
              <button className="text-sm text-gray-600 hover:text-gray-800 hover:underline">
                ← Volver al inicio
              </button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}