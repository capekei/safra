/**
 * API Response Validation for SafraReport
 * TypeScript utilities to prevent runtime issues with API responses
 */

import type { User } from "@shared/schema";

// Base API response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Article-related types
export interface ArticleResponse {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
}

export interface ArticleListResponse extends ApiResponse {
  data: ArticleResponse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Category-related types
export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  articlesCount?: number;
}

// User-related types
export interface AuthResponse extends ApiResponse {
  data: {
    user: User;
    token?: string;
  };
}

// Validation utilities
export function isValidApiResponse<T>(
  response: unknown,
  validator?: (data: any) => data is T
): response is ApiResponse<T> {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const apiResponse = response as ApiResponse<T>;
  
  // Basic structure validation
  if (apiResponse.success === false && !apiResponse.message) {
    return false;
  }

  // Optional data validation
  if (validator && apiResponse.data) {
    return validator(apiResponse.data);
  }

  return true;
}

export function isValidArticle(data: any): data is ArticleResponse {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    typeof data.title === 'string' &&
    typeof data.slug === 'string' &&
    typeof data.content === 'string' &&
    typeof data.author === 'string' &&
    ['draft', 'published', 'archived'].includes(data.status)
  );
}

export function isValidCategory(data: any): data is CategoryResponse {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    typeof data.name === 'string' &&
    typeof data.slug === 'string'
  );
}

export function isValidUser(data: any): data is User {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    typeof data.email === 'string' &&
    typeof data.username === 'string'
  );
}

// API endpoint constants
export const API_ENDPOINTS = {
  // Articles
  ARTICLES: '/api/articles',
  ARTICLE_BY_SLUG: (slug: string) => `/api/articles/${encodeURIComponent(slug)}`,
  
  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY_BY_SLUG: (slug: string) => `/api/categories/${encodeURIComponent(slug)}`,
  
  // User/Auth
  AUTH_USER: '/api/auth/user',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REGISTER: '/api/auth/register',
  
  // Admin
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_ARTICLES: '/api/admin/articles',
  ADMIN_USERS: '/api/admin/users',
  
  // Content creation
  CLASIFICADOS: '/api/clasificados',
  RESENAS: '/api/resenas',
} as const;

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(response: Response, message?: string): ApiError {
    return new ApiError(
      message || `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }
}

// Response validation middleware
export function validateApiResponse<T>(
  response: unknown,
  validator?: (data: any) => data is T
): T {
  if (!isValidApiResponse(response, validator)) {
    throw new ApiError('Invalid API response format', 500, 'INVALID_RESPONSE');
  }

  if (response.success === false) {
    throw new ApiError(
      response.message || 'API request failed',
      500,
      'API_ERROR'
    );
  }

  return response.data as T;
}

// Network status utilities
export function isNetworkError(error: Error): boolean {
  return (
    error.message.includes('NetworkError') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('fetch')
  );
}

export function isCorsError(error: Error): boolean {
  return (
    error.message.includes('CORS') ||
    error.message.includes('Access-Control-Allow-Origin')
  );
}