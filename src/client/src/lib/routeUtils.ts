/**
 * Route utilities for SafraReport - Dominican marketplace app
 * Handles edge cases for routing, especially with Spanish URLs and special characters
 */

/**
 * Safely decode URI component with fallback for malformed URIs
 */
export function safeDecodeURIComponent(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch (error) {
    console.warn('Failed to decode URI component:', encoded, error);
    return encoded;
  }
}

/**
 * Encode slug for URL with proper handling of Spanish characters
 */
export function encodeSlug(slug: string): string {
  return encodeURIComponent(slug.toLowerCase().trim());
}

/**
 * Normalize slug for comparison (useful for finding articles/categories)
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[áàâäã]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôöõ]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Check if route requires authentication
 */
export function isProtectedUserRoute(path: string): boolean {
  const protectedPaths = [
    '/cuenta',
    '/cuenta/panel',
    '/cuenta/preferencias',
    '/clasificados/nuevo',
    '/resenas/nueva'
  ];
  
  return protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(protectedPath + '/')
  );
}

/**
 * Check if route requires admin authentication
 */
export function isProtectedAdminRoute(path: string): boolean {
  return path.startsWith('/admin') && path !== '/admin' && path !== '/admin/login';
}

/**
 * Generate breadcrumb data for current route
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function generateBreadcrumbs(path: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' }
  ];

  if (path === '/') return breadcrumbs;

  const segments = path.split('/').filter(Boolean);
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Map route segments to Spanish labels
    const segmentLabels: Record<string, string> = {
      'articulo': 'Artículo',
      'seccion': 'Sección',
      'clasificados': 'Clasificados',
      'resenas': 'Reseñas',
      'cuenta': 'Mi Cuenta',
      'panel': 'Panel',
      'preferencias': 'Preferencias',
      'nuevo': 'Nuevo',
      'nueva': 'Nueva',
      'admin': 'Administración',
      'dashboard': 'Dashboard',
      'articles': 'Artículos',
      'authors': 'Autores',
      'moderation': 'Moderación',
      'database': 'Base de Datos',
      'reviews': 'Reseñas',
      'users': 'Usuarios',
      'audit': 'Auditoría',
      'ads': 'Anuncios'
    };

    const label = segmentLabels[segment] || safeDecodeURIComponent(segment);
    
    breadcrumbs.push({
      label,
      href: currentPath
    });
  });

  return breadcrumbs;
}

/**
 * Get page title based on route
 */
export function getPageTitle(path: string, defaultTitle = 'SafraReport'): string {
  const titleMap: Record<string, string> = {
    '/': 'SafraReport - Noticias de República Dominicana',
    '/clasificados': 'Clasificados - SafraReport',
    '/resenas': 'Reseñas de Negocios - SafraReport',
    '/cuenta': 'Mi Cuenta - SafraReport',
    '/cuenta/panel': 'Panel de Usuario - SafraReport',
    '/cuenta/preferencias': 'Preferencias - SafraReport',
    '/clasificados/nuevo': 'Publicar Clasificado - SafraReport',
    '/resenas/nueva': 'Nueva Reseña - SafraReport',
    '/login': 'Iniciar Sesión - SafraReport',
    '/admin': 'Administración - SafraReport',
    '/admin/login': 'Login Administrativo - SafraReport',
    '/admin/dashboard': 'Dashboard Admin - SafraReport'
  };

  // Handle dynamic routes
  if (path.startsWith('/articulo/')) {
    const slug = path.split('/')[2];
    return `${safeDecodeURIComponent(slug)} - SafraReport`;
  }
  
  if (path.startsWith('/seccion/')) {
    const slug = path.split('/')[2];
    return `${safeDecodeURIComponent(slug)} - SafraReport`;
  }

  return titleMap[path] || defaultTitle;
}

/**
 * Validate route parameters
 */
export function validateRouteParams(params: Record<string, string>): boolean {
  // Check for common malicious patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /%3Cscript/i
  ];

  return Object.values(params).every(value => 
    !maliciousPatterns.some(pattern => pattern.test(value))
  );
}