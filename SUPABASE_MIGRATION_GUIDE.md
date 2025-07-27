# SafraReport: Guía de Migración a Supabase Auth

Esta guía te ayudará a migrar el sistema de autenticación de SafraReport de Auth0 a Supabase Auth, incluyendo configuración, migración de usuarios y pruebas.

## 🚀 Descripción General

### ¿Qué se migró?

- ✅ **Auth0** → **Supabase Auth**
- ✅ **Sesiones Express** → **JWT con Supabase**
- ✅ **Credenciales hardcodeadas** → **Base de datos segura**
- ✅ **Middleware personalizado** → **Middleware estandarizado**
- ✅ **Sin rate limiting** → **Rate limiting implementado**
- ✅ **Headers básicos** → **Helmet security headers**
- ✅ **Validación manual** → **Zod schema validation**

### Beneficios de la migración

- 🔒 **Seguridad mejorada**: MFA, rate limiting, CSRF protection
- 🚀 **Rendimiento**: Mejor manejo de sesiones y tokens
- 🌐 **Escalabilidad**: Supabase maneja millones de usuarios
- 💰 **Costo**: Más económico que Auth0 para la mayoría de casos
- 🛠️ **Mantenimiento**: Menos dependencias y código personalizado

## 📋 Prerequisitos

1. **Cuenta de Supabase**: Crear proyecto en [supabase.com](https://supabase.com)
2. **Node.js 18+**: Para ejecutar scripts de migración
3. **Acceso a base de datos**: Para crear tablas y triggers
4. **Variables de entorno**: Configurar keys de Supabase

## 🔧 Configuración Paso a Paso

### Paso 1: Crear Proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto:
   - **Nombre**: SafraReport
   - **Región**: Elegir la más cercana a República Dominicana
   - **Plan**: Gratuito para empezar
3. Espera a que se complete la configuración (2-3 minutos)

### Paso 2: Configurar Base de Datos

1. En el panel de Supabase, ve a **SQL Editor**
2. Crea una nueva query y pega el contenido de `server/supabase-schema.sql`
3. Ejecuta el script para crear tablas y triggers
4. Verifica que la tabla `users` se creó correctamente

### Paso 3: Configurar Variables de Entorno

#### Servidor (Backend)

Agrega estas variables a tu entorno de producción:

```bash
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto-id.supabase.co
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# Frontend URL para redirects
FRONTEND_URL=https://tu-dominio-frontend.com

# Admin por defecto (opcional)
DEFAULT_ADMIN_PASSWORD=TuPasswordSeguro123!
```

#### Cliente (Frontend)

Crea o actualiza `client/.env`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Paso 4: Configurar Autenticación en Supabase

1. En Supabase, ve a **Authentication** → **Settings**
2. **Site URL**: `https://tu-dominio.com`
3. **Redirect URLs**: Agregar:
   - `https://tu-dominio.com/auth/callback`
   - `https://tu-dominio.com/reset-password`
   - `http://localhost:5173/auth/callback` (desarrollo)

#### Configurar Proveedores OAuth (Opcional)

Para **Google**:
1. Ve a **Authentication** → **Providers** → **Google**
2. Habilita Google y configura Client ID y Secret
3. Redirect URL: `https://tu-proyecto.supabase.co/auth/v1/callback`

Para **Facebook**:
1. Ve a **Authentication** → **Providers** → **Facebook**  
2. Habilita Facebook y configura App ID y Secret

### Paso 5: Migrar Usuarios Existentes

Ejecuta el script de migración:

```bash
# Instalar dependencias primero
npm install

# Ejecutar migración
tsx server/migrate-auth0-to-supabase.ts
```

El script:
- ✅ Migra usuarios de la base de datos actual
- ✅ Crea usuario administrador por defecto
- ✅ Preserva roles y metadatos
- ✅ Genera contraseñas temporales seguras

### Paso 6: Actualizar Configuración de Email

1. En Supabase, ve a **Authentication** → **Settings** → **Email Templates**
2. Personaliza plantillas para:
   - **Confirmación de cuenta**
   - **Recuperación de contraseña**
   - **Cambio de email**

Ejemplo de plantilla de confirmación:

```html
<h2>¡Bienvenido a SafraReport!</h2>
<p>Confirma tu cuenta haciendo clic en el enlace:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar cuenta</a></p>
<p>¡Gracias por unirte a nuestra comunidad!</p>
```

## 🧪 Pruebas del Sistema

### Pruebas Automáticas

Ejecuta el script de pruebas:

```bash
tsx server/test-supabase-auth.ts
```

### Pruebas Manuales

1. **Registro de usuario**: Crear cuenta nueva
2. **Inicio de sesión**: Login con email/password
3. **OAuth**: Login con Google/Facebook
4. **Recuperación**: Reset de contraseña
5. **Acceso admin**: Verificar permisos
6. **Rate limiting**: Múltiples intentos fallidos

## 🚀 Despliegue

### Actualizaciones Requeridas

1. **Variables de entorno**: Configurar en plataforma de hosting
2. **Build process**: Asegurar que nuevas dependencias están incluidas
3. **Health checks**: Verificar que endpoints responden
4. **SSL**: Asegurar HTTPS en producción

### Rollback Plan

Si necesitas revertir los cambios:

1. Los archivos originales están en `server/backup/`
2. Restaurar dependencias: `npm install express-oauth2-jwt-bearer @auth0/auth0-react`
3. Revertir cambios en `server/routes.ts`
4. Restaurar variables de entorno de Auth0

## 🔒 Consideraciones de Seguridad

### Implementado

- ✅ **Rate Limiting**: 5 intentos de login por 15 minutos
- ✅ **Helmet Headers**: CSP, XSS protection, etc.
- ✅ **CSRF Protection**: Tokens para formularios
- ✅ **Zod Validation**: Validación de entrada estricta
- ✅ **JWT Verification**: Tokens verificados con Supabase
- ✅ **RLS Policies**: Row Level Security en base de datos

### Recomendaciones Adicionales

1. **Monitoreo**: Configurar alertas para intentos de login fallidos
2. **Backup**: Backup regular de la base de datos de usuarios
3. **Auditoría**: Log de acciones administrativas
4. **2FA**: Habilitar MFA para usuarios admin
5. **Rotación**: Rotar keys de API regularmente

## 📱 Actualizaciones del Frontend

### Componentes Actualizados

- `hooks/useAuth.ts`: Nueva implementación con Supabase
- `components/auth/SupabaseLoginForm.tsx`: Formulario de login moderno
- Variables de entorno actualizadas

### Cambios de API

Los endpoints cambiaron de:
```
POST /api/auth/admin → POST /api/auth/signin
POST /api/auth/social → POST /api/auth/oauth
GET /api/auth/user → GET /api/auth/user (sin cambios)
```

## 🐛 Troubleshooting

### Errores Comunes

**Error: "Faltan variables de entorno de Supabase"**
- Verifica que `SUPABASE_URL` y `SUPABASE_ANON_KEY` estén configuradas

**Error: "Token inválido o expirado"**
- Verificar que las keys de Supabase sean correctas
- Comprobar que el token no haya expirado

**Error: "Usuario no encontrado en la base de datos"**
- Ejecutar script de migración
- Verificar que las tablas fueron creadas

**Error de CORS**
- Configurar dominios permitidos en Supabase
- Verificar headers CORS en el backend

### Logs de Debug

Para habilitar logs detallados:

```bash
# Backend
DEBUG=supabase:* npm run dev

# Frontend
VITE_ENABLE_DEBUG_LOGS=true npm run dev
```

## 📞 Soporte

Si encuentras problemas durante la migración:

1. **Revisa logs**: Servidor y cliente
2. **Verifica configuración**: Variables de entorno
3. **Prueba endpoints**: Con herramientas como Postman
4. **Consulta documentación**: [Supabase Docs](https://supabase.com/docs)

## 📈 Próximos Pasos

Después de la migración exitosa:

1. **Monitoreo**: Configurar métricas de autenticación
2. **Optimización**: Ajustar rate limits según uso real
3. **Features**: Implementar MFA para usuarios críticos
4. **Analytics**: Trackear patrones de uso de autenticación
5. **Mobile**: Implementar autenticación para app móvil

---

## 🎉 ¡Migración Completa!

Tu sistema de autenticación ahora es más seguro, escalable y moderno. Los usuarios disfrutarán de:

- 🔐 Autenticación más rápida y segura
- 📱 Mejor experiencia en móviles
- 🌐 Login social con múltiples proveedores
- 🛡️ Protección contra ataques comunes
- 🚀 Mejor rendimiento general

¡Felicidades por completar la migración a Supabase Auth!