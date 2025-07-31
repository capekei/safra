const translations = {
  es: {
    connectionError: "Error de conexión",
    featuredArticlesError: "No se pudieron cargar los artículos destacados. Verifica tu conexión a internet.",
    articlesError: "No se pudieron cargar los artículos. Verifica tu conexión a internet.",
    reload: "Recargar página",
    noFeaturedArticles: "No hay artículos destacados disponibles en este momento.",
    tryAgainLater: "Vuelve a intentarlo más tarde.",
  },
  en: {
    connectionError: "Connection Error",
    featuredArticlesError: "Could not load featured articles. Please check your internet connection.",
    articlesError: "Could not load articles. Please check your internet connection.",
    reload: "Reload page",
    noFeaturedArticles: "No featured articles available at the moment.",
    tryAgainLater: "Please try again later.",
  },
};

export function useI18n() {
  const lang = navigator.language.split('-')[0] as keyof typeof translations;
  return translations[lang] || translations.es;
}
