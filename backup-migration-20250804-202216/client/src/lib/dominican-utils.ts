/**
 * Dominican Republic Specific Utilities for SafraReport
 * Optimized for local users, currency, and cultural preferences
 */

// Dominican Peso formatting
export function formatDOP(amount: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Compact DOP formatting for mobile/small spaces
export function formatCompactDOP(amount: number): string {
  if (amount >= 1000000) {
    return `RD$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `RD$${(amount / 1000).toFixed(1)}K`;
  }
  return `RD$${amount.toLocaleString('es-DO')}`;
}

// Dominican phone number formatting
export function formatDominicanPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (digits.length === 10 && digits.startsWith('809')) {
    // 8091234567 -> (809) 123-4567
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 10 && digits.startsWith('829')) {
    // 8291234567 -> (829) 123-4567
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 10 && digits.startsWith('849')) {
    // 8491234567 -> (849) 123-4567
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Fallback: return as-is
  return phone;
}

// Dominican provinces (32 provinces + Distrito Nacional)
export const DOMINICAN_PROVINCES = [
  { id: 1, name: 'Distrito Nacional', code: 'DN' },
  { id: 2, name: 'Azua', code: 'AZ' },
  { id: 3, name: 'Bahoruco', code: 'BH' },
  { id: 4, name: 'Barahona', code: 'BR' },
  { id: 5, name: 'Dajabón', code: 'DJ' },
  { id: 6, name: 'Duarte', code: 'DU' },
  { id: 7, name: 'Elías Piña', code: 'EP' },
  { id: 8, name: 'El Seibo', code: 'ES' },
  { id: 9, name: 'Espaillat', code: 'ESP' },
  { id: 10, name: 'Hato Mayor', code: 'HM' },
  { id: 11, name: 'Hermanas Mirabal', code: 'HMR' },
  { id: 12, name: 'Independencia', code: 'IN' },
  { id: 13, name: 'La Altagracia', code: 'LA' },
  { id: 14, name: 'La Romana', code: 'LR' },
  { id: 15, name: 'La Vega', code: 'LV' },
  { id: 16, name: 'María Trinidad Sánchez', code: 'MTS' },
  { id: 17, name: 'Monseñor Nouel', code: 'MN' },
  { id: 18, name: 'Monte Cristi', code: 'MC' },
  { id: 19, name: 'Monte Plata', code: 'MP' },
  { id: 20, name: 'Pedernales', code: 'PD' },
  { id: 21, name: 'Peravia', code: 'PV' },
  { id: 22, name: 'Puerto Plata', code: 'PP' },
  { id: 23, name: 'Samaná', code: 'SM' },
  { id: 24, name: 'San Cristóbal', code: 'SC' },
  { id: 25, name: 'San José de Ocoa', code: 'SJO' },
  { id: 26, name: 'San Juan', code: 'SJ' },
  { id: 27, name: 'San Pedro de Macorís', code: 'SPM' },
  { id: 28, name: 'Sánchez Ramírez', code: 'SR' },
  { id: 29, name: 'Santiago', code: 'ST' },
  { id: 30, name: 'Santiago Rodríguez', code: 'STR' },
  { id: 31, name: 'Santo Domingo', code: 'SD' },
  { id: 32, name: 'Valverde', code: 'VV' }
] as const;

// Get province by ID
export function getProvinceById(id: number) {
  return DOMINICAN_PROVINCES.find(province => province.id === id);
}

// Get province by name
export function getProvinceByName(name: string) {
  return DOMINICAN_PROVINCES.find(
    province => province.name.toLowerCase() === name.toLowerCase()
  );
}

// Time formatting for Dominican timezone
export function formatDominicanTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-DO', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(dateObj);
}

// Relative time in Spanish for Dominican users
export function getRelativeTimeDominican(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ahora mismo';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `Hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
}

// Dominican Spanish text normalization
export function normalizeDominicanText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents for search
    .toLowerCase()
    .trim();
}

// Common Dominican marketplace categories
export const CLASSIFIED_CATEGORIES_DOMINICAN = [
  'Vehículos',
  'Inmuebles',
  'Empleos',
  'Servicios',
  'Electrónicos',
  'Hogar y Jardín',
  'Ropa y Accesorios',
  'Deportes y Recreación',
  'Mascotas',
  'Negocios'
] as const;

export const BUSINESS_CATEGORIES_DOMINICAN = [
  'Restaurantes',
  'Hoteles y Turismo',
  'Salud y Belleza',
  'Educación',
  'Transporte',
  'Construcción',
  'Tecnología',
  'Servicios Financieros',
  'Entretenimiento',
  'Comercio'
] as const;

// Validate Dominican cedula (basic format check)
export function validateDominicanCedula(cedula: string): boolean {
  // Remove hyphens and spaces
  const cleanCedula = cedula.replace(/[-\s]/g, '');
  
  // Must be 11 digits
  if (!/^\d{11}$/.test(cleanCedula)) {
    return false;
  }
  
  // Basic checksum validation (simplified)
  const digits = cleanCedula.split('').map(Number);
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let product = digits[i] * weights[i];
    if (product > 9) {
      product = Math.floor(product / 10) + (product % 10);
    }
    sum += product;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[10];
}

// Format Dominican cedula for display
export function formatDominicanCedula(cedula: string): string {
  const cleanCedula = cedula.replace(/\D/g, '');
  if (cleanCedula.length === 11) {
    return `${cleanCedula.slice(0, 3)}-${cleanCedula.slice(3, 10)}-${cleanCedula.slice(10)}`;
  }
  return cedula;
}

// Dominican business hours helper
export function isDominicanBusinessHours(): boolean {
  const now = new Date();
  const dominicanTime = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Santo_Domingo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);
  
  const [hours] = dominicanTime.split(':').map(Number);
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Monday to Friday: 8 AM to 6 PM
  if (day >= 1 && day <= 5) {
    return hours >= 8 && hours < 18;
  }
  
  // Saturday: 9 AM to 2 PM
  if (day === 6) {
    return hours >= 9 && hours < 14;
  }
  
  // Sunday: closed
  return false;
}