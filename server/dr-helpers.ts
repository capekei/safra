// Dominican Republic helpers for SafraReport marketplace
// Spanish-first utilities with DOP currency formatting and mobile-optimized error handling

// DOP currency formatter with Dominican locale
export function formatDOPPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) {
    console.warn('Invalid price for DOP formatting:', price);
    return 'DOP $0';
  }
  
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericPrice);
}

// Spanish error messages with consistent structure
export const DR_ERRORS = {
  DATABASE_ERROR: { error: 'Error de base de datos', code: 'DATABASE_ERROR' },
  VALIDATION_ERROR: { error: 'Error de validación', code: 'VALIDATION_ERROR' },
  NOT_FOUND: { error: 'No encontrado', code: 'NOT_FOUND' },
  PERMISSION_DENIED: { error: 'Acceso denegado', code: 'PERMISSION_DENIED' },
  INVALID_ID: { error: 'ID inválido', code: 'INVALID_ID' },
  REQUIRED_FIELDS: { error: 'Campos requeridos faltantes', code: 'REQUIRED_FIELDS' }
} as const;

// Mobile-optimized error display helper
export function formatMobileError(message: string): string {
  return `<div class="bg-red-500 text-white p-3 rounded-lg sm:w-1/2 mx-auto text-center">${message}</div>`;
}

// Type-safe helper for Drizzle insert operations (fixes TS2769)
export function safeInsertData<T>(data: T): T {
  return data as T;
}

// Enhanced array conversion for images with strict typing
export function convertToStringArray(images: unknown): string[] {
  if (!images) return [];
  
  try {
    if (Array.isArray(images)) {
      return images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0);
    }
    
    if (typeof images === 'object' && images !== null && 'length' in images) {
      const arrayLike = images as ArrayLike<unknown>;
      const result: string[] = [];
      for (let i = 0; i < arrayLike.length; i++) {
        const item = arrayLike[i];
        if (typeof item === 'string' && item.trim().length > 0) {
          result.push(item.trim());
        }
      }
      return result;
    }
    
    if (typeof images === 'object' && images !== null) {
      return Object.values(images)
        .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
        .map(img => img.trim());
    }
    
    return [];
  } catch (error) {
    console.error('Error converting images array:', error);
    return [];
  }
}

// Production-ready error handler with Spanish messages
export function handleDRError(error: unknown, operation: string): never {
  console.error(`DR Storage ${operation} error:`, error);
  throw new Error(JSON.stringify(DR_ERRORS.DATABASE_ERROR));
}