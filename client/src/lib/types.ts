export interface ArticleWithRelations {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  isBreaking: boolean;
  isFeatured: boolean;
  published: boolean;
  publishedAt: string;
  authorId: number;
  categoryId: number;
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    createdAt: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
    description?: string;
    createdAt: string;
  };
}

export interface ClassifiedWithRelations {
  id: number;
  title: string;
  description: string;
  price?: string;
  currency: string;
  images: string[];
  contactName: string;
  contactPhone: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  provinceId?: number;
  municipality?: string;
  categoryId: number;
  active: boolean;
  featured: boolean;
  expiresAt: string;
  createdAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
  province?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface BusinessWithRelations {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  images: string[];
  priceRange: number;
  categoryId: number;
  provinceId?: number;
  municipality?: string;
  averageRating: string;
  totalReviews: number;
  verified: boolean;
  active: boolean;
  createdAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
  province?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface ReviewType {
  id: number;
  businessId: number;
  reviewerName: string;
  reviewerEmail?: string;
  rating: number;
  title?: string;
  content: string;
  images: string[];
  helpful: number;
  approved: boolean;
  createdAt: string;
}

export const ROUTES = {
  HOME: '/',
  ACCOUNT: "/cuenta",
  ADMIN: "/admin",
  LOGIN: '/login',
} as const;
