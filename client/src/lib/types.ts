// Common types for SafraReport client
export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  videoUrl?: string;
  isBreaking: boolean;
  isFeatured: boolean;
  published: boolean;
  publishedAt: string;
  authorId: number;
  categoryId: number;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleWithRelations extends Article {
  category?: Category;
  author?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Province {
  id: number;
  name: string;
  code: string;
  region: string;
}

export interface Classified {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: number;
  provinceId: number;
  images?: string[];
  contactPhone?: string;
  contactEmail?: string;
  userId: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  categoryId: number;
  provinceId: number;
  rating: number;
  totalReviews: number;
  images?: string[];
  verified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  businessId: number;
  userId: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterForm {
  email: string;
  preferences?: string[];
}

// Routes configuration
export const ROUTES = {
  HOME: '/',
  NOTICIAS: '/noticias',
  CATEGORIA: '/categoria',
  CLASIFICADOS: '/clasificados',
  RESENAS: '/resenas',
  CUENTA: '/cuenta',
  LOGIN: '/login',
  ADMIN: '/admin',
  USER_DASHBOARD: '/cuenta/dashboard',
  POST_CLASSIFIED: '/cuenta/clasificado',
  POST_REVIEW: '/cuenta/resena',
  NEWS_PREFERENCES: '/cuenta/preferencias'
} as const;