// Simple i18n implementation for Dominican Republic Spanish
const translations = {
  es: {
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    
    // Navigation
    home: 'Inicio',
    news: 'Noticias',
    classifieds: 'Clasificados',
    reviews: 'Reseñas',
    account: 'Cuenta',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    
    // Articles
    readMore: 'Leer más',
    article: 'Artículo',
    articles: 'Artículos',
    category: 'Categoría',
    categories: 'Categorías',
    publishedAt: 'Publicado el',
    author: 'Autor',
    views: 'vistas',
    likes: 'me gusta',
    
    // Dominican specific
    province: 'Provincia',
    provinces: 'Provincias',
    municipality: 'Municipio',
    municipalities: 'Municipios',
    dominicanRepublic: 'República Dominicana',
    
    // Currency
    currency: 'DOP',
    price: 'Precio',
    
    // Time
    now: 'ahora',
    minute: 'minuto',
    minutes: 'minutos',
    hour: 'hora',
    hours: 'horas',
    day: 'día',
    days: 'días',
    week: 'semana',
    weeks: 'semanas',
    month: 'mes',
    months: 'meses',
    year: 'año',
    years: 'años',
    ago: 'hace',
  }
};

type TranslationKey = keyof typeof translations.es;

export function useI18n() {
  const locale = 'es'; // Default to Spanish for Dominican Republic
  
  const t = (key: TranslationKey, variables?: Record<string, string | number>): string => {
    let translation = translations[locale][key] || key;
    
    // Simple variable substitution
    if (variables) {
      Object.entries(variables).forEach(([varKey, value]) => {
        translation = translation.replace(`{{${varKey}}}`, String(value));
      });
    }
    
    return translation;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  };

  const formatRelativeTime = (date: Date | string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('now');
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${t('ago')} ${diffInMinutes} ${diffInMinutes === 1 ? t('minute') : t('minutes')}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${t('ago')} ${diffInHours} ${diffInHours === 1 ? t('hour') : t('hours')}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${t('ago')} ${diffInDays} ${diffInDays === 1 ? t('day') : t('days')}`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${t('ago')} ${diffInWeeks} ${diffInWeeks === 1 ? t('week') : t('weeks')}`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${t('ago')} ${diffInMonths} ${diffInMonths === 1 ? t('month') : t('months')}`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${t('ago')} ${diffInYears} ${diffInYears === 1 ? t('year') : t('years')}`;
  };

  return {
    t,
    locale,
    formatCurrency,
    formatDate,
    formatRelativeTime,
  };
}