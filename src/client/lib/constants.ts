// Constants for SafraReport client
export const API_BASE_URL = '/api';
export const DEFAULT_PAGE_SIZE = 20;
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Dominican Republic specific constants
export const DOMINICAN_PROVINCES = [
  'Santo Domingo',
  'Santiago',
  'Puerto Plata',
  'La Romana',
  'San Pedro de Macorís',
  'Barahona',
  'San Juan',
  'Azua',
  'Monte Cristi',
  'Valverde',
  'Duarte',
  'María Trinidad Sánchez',
  'Samaná',
  'La Vega',
  'Sánchez Ramírez',
  'Monseñor Nouel',
  'Espaillat',
  'Hermanas Mirabal',
  'San Cristóbal',
  'Peravia',
  'Monte Plata',
  'Hato Mayor',
  'El Seibo',
  'La Altagracia',
  'San José de Ocoa',
  'Independencia',
  'Baoruco',
  'Pedernales',
  'Dajabón',
  'Santiago Rodríguez',
  'Elías Piña'
];

export const NEWS_CATEGORIES = [
  { id: 1, name: 'Noticias', slug: 'noticias' },
  { id: 2, name: 'Deportes', slug: 'deportes' },
  { id: 3, name: 'Entretenimiento', slug: 'entretenimiento' },
  { id: 4, name: 'Economía', slug: 'economia' },
  { id: 5, name: 'Tecnología', slug: 'tecnologia' },
  { id: 6, name: 'Salud', slug: 'salud' },
  { id: 7, name: 'Política', slug: 'politica' }
];

export const BUSINESS_CATEGORIES = [
  { id: 1, name: 'Restaurantes', slug: 'restaurantes' },
  { id: 2, name: 'Hoteles', slug: 'hoteles' },
  { id: 3, name: 'Servicios', slug: 'servicios' },
  { id: 4, name: 'Tiendas', slug: 'tiendas' },
  { id: 5, name: 'Salud', slug: 'salud' },
  { id: 6, name: 'Entretenimiento', slug: 'entretenimiento' }
];

export const CLASSIFIED_CATEGORIES = [
  { id: 1, name: 'Vehículos', slug: 'vehiculos' },
  { id: 2, name: 'Inmuebles', slug: 'inmuebles' },
  { id: 3, name: 'Empleos', slug: 'empleos' },
  { id: 4, name: 'Servicios', slug: 'servicios' },
  { id: 5, name: 'Electrónicos', slug: 'electronicos' },
  { id: 6, name: 'Ropa y Accesorios', slug: 'ropa-accesorios' },
  { id: 7, name: 'Hogar y Jardín', slug: 'hogar-jardin' },
  { id: 8, name: 'Deportes', slug: 'deportes' },
  { id: 9, name: 'Mascotas', slug: 'mascotas' },
  { id: 10, name: 'Otros', slug: 'otros' }
];

export const CURRENCY = 'DOP';
export const LOCALE = 'es-DO';
export const TIMEZONE = 'America/Santo_Domingo';