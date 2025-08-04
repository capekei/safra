import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database, DatabaseUser } from '../server/supabase';

// Extend SupabaseClient with strict Database typing
export type TypedSupabaseClient = SupabaseClient<Database>;

// Initialize typed Supabase clients
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno de Supabase');
}

// Typed client for regular operations
export const typedSupabase: TypedSupabaseClient = createClient<Database>(supabaseUrl, supabaseKey);

// Typed admin client for service operations
export const typedSupabaseAdmin: TypedSupabaseClient | null = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Storage error types
export interface StorageError {
  code: string;
  message: string;
  details?: string;
}

export interface StorageResult<T> {
  data: T | null;
  error: StorageError | null;
}

// Spanish error messages
const STORAGE_ERRORS = {
  UPLOAD_FAILED: 'Error al subir archivo',
  DOWNLOAD_FAILED: 'Error al descargar archivo',
  DELETE_FAILED: 'Error al eliminar archivo',
  LIST_FAILED: 'Error al listar archivos',
  BUCKET_NOT_FOUND: 'Bucket no encontrado',
  FILE_NOT_FOUND: 'Archivo no encontrado',
  PERMISSION_DENIED: 'Permisos insuficientes',
  FILE_TOO_LARGE: 'Archivo demasiado grande',
  INVALID_FILE_TYPE: 'Tipo de archivo no válido',
  NETWORK_ERROR: 'Error de conexión',
  UNKNOWN_ERROR: 'Error desconocido'
} as const;

// File upload options
export interface UploadOptions {
  bucket: string;
  path: string;
  file: File | Buffer;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

// File download options
export interface DownloadOptions {
  bucket: string;
  path: string;
}

// File list options
export interface ListOptions {
  bucket: string;
  path?: string;
  limit?: number;
  offset?: number;
}

// Typed storage wrapper functions
export class TypedSupabaseStorage {
  private client: TypedSupabaseClient;

  constructor(client: TypedSupabaseClient = typedSupabase) {
    this.client = client;
  }

  /**
   * Upload a file to Supabase storage with proper error handling
   */
  async uploadFile(options: UploadOptions): Promise<StorageResult<{ path: string; fullPath: string }>> {
    try {
      if (!options.file) {
        return {
          data: null,
          error: {
            code: 'INVALID_FILE',
            message: STORAGE_ERRORS.UPLOAD_FAILED,
            details: 'No se proporcionó archivo'
          }
        };
      }

      const { data, error } = await this.client.storage
        .from(options.bucket)
        .upload(options.path, options.file, {
          contentType: options.contentType,
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          data: null,
          error: {
            code: (error as any).error || 'UPLOAD_ERROR',
            message: STORAGE_ERRORS.UPLOAD_FAILED,
            details: error.message
          }
        };
      }

      if (!data) {
        return {
          data: null,
          error: {
            code: 'NO_DATA',
            message: STORAGE_ERRORS.UPLOAD_FAILED,
            details: 'No se recibieron datos del servidor'
          }
        };
      }

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath
        },
        error: null
      };
    } catch (error) {
      console.error('Storage upload exception:', error);
      return {
        data: null,
        error: {
          code: 'EXCEPTION',
          message: STORAGE_ERRORS.UPLOAD_FAILED,
          details: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }

  /**
   * Download a file from Supabase storage
   */
  async downloadFile(options: DownloadOptions): Promise<StorageResult<Blob>> {
    try {
      const { data, error } = await this.client.storage
        .from(options.bucket)
        .download(options.path);

      if (error) {
        console.error('Storage download error:', error);
        return {
          data: null,
          error: {
            code: (error as any).error || 'DOWNLOAD_ERROR',
            message: STORAGE_ERRORS.DOWNLOAD_FAILED,
            details: error.message
          }
        };
      }

      if (!data) {
        return {
          data: null,
          error: {
            code: 'FILE_NOT_FOUND',
            message: STORAGE_ERRORS.FILE_NOT_FOUND,
            details: `Archivo no encontrado: ${options.path}`
          }
        };
      }

      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Storage download exception:', error);
      return {
        data: null,
        error: {
          code: 'EXCEPTION',
          message: STORAGE_ERRORS.DOWNLOAD_FAILED,
          details: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): StorageResult<{ publicUrl: string }> {
    try {
      const { data } = this.client.storage
        .from(bucket)
        .getPublicUrl(path);

      if (!data?.publicUrl) {
        return {
          data: null,
          error: {
            code: 'NO_PUBLIC_URL',
            message: 'No se pudo generar URL pública',
            details: `Bucket: ${bucket}, Path: ${path}`
          }
        };
      }

      return {
        data: {
          publicUrl: data.publicUrl
        },
        error: null
      };
    } catch (error) {
      console.error('Storage public URL exception:', error);
      return {
        data: null,
        error: {
          code: 'EXCEPTION',
          message: 'Error al generar URL pública',
          details: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<StorageResult<{ path: string }>> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Storage delete error:', error);
        return {
          data: null,
          error: {
            code: (error as any).error || 'DELETE_ERROR',
            message: STORAGE_ERRORS.DELETE_FAILED,
            details: error.message
          }
        };
      }

      return {
        data: { path },
        error: null
      };
    } catch (error) {
      console.error('Storage delete exception:', error);
      return {
        data: null,
        error: {
          code: 'EXCEPTION',
          message: STORAGE_ERRORS.DELETE_FAILED,
          details: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }

  /**
   * List files in a bucket
   */
  async listFiles(options: ListOptions): Promise<StorageResult<Array<{ name: string; id: string; updated_at: string; created_at: string; last_accessed_at: string; metadata: Record<string, any> }>>> {
    try {
      const { data, error } = await this.client.storage
        .from(options.bucket)
        .list(options.path, {
          limit: options.limit || 100,
          offset: options.offset || 0
        });

      if (error) {
        console.error('Storage list error:', error);
        return {
          data: null,
          error: {
            code: (error as any).error || 'LIST_ERROR',
            message: STORAGE_ERRORS.LIST_FAILED,
            details: error.message
          }
        };
      }

      return {
        data: data || [],
        error: null
      };
    } catch (error) {
      console.error('Storage list exception:', error);
      return {
        data: null,
        error: {
          code: 'EXCEPTION',
          message: STORAGE_ERRORS.LIST_FAILED,
          details: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }
}

// Default storage instance
export const typedStorage = new TypedSupabaseStorage();

// Helper functions for common storage operations
export const uploadImage = async (
  file: File | Buffer, 
  path: string, 
  bucket: string = 'images'
): Promise<StorageResult<{ path: string; fullPath: string; publicUrl: string }>> => {
  const uploadResult = await typedStorage.uploadFile({
    bucket,
    path,
    file,
    contentType: file instanceof File ? file.type : 'image/jpeg',
    cacheControl: '31536000' // 1 year cache
  });

  if (uploadResult.error || !uploadResult.data) {
    return {
      data: null,
      error: uploadResult.error
    };
  }

  const urlResult = typedStorage.getPublicUrl(bucket, uploadResult.data.path);
  
  if (urlResult.error || !urlResult.data) {
    return {
      data: null,
      error: urlResult.error
    };
  }

  return {
    data: {
      ...uploadResult.data,
      publicUrl: urlResult.data.publicUrl
    },
    error: null
  };
};

export const uploadDocument = async (
  file: File | Buffer, 
  path: string, 
  bucket: string = 'documents'
): Promise<StorageResult<{ path: string; fullPath: string; publicUrl: string }>> => {
  const uploadResult = await typedStorage.uploadFile({
    bucket,
    path,
    file,
    contentType: file instanceof File ? file.type : 'application/pdf',
    cacheControl: '86400' // 1 day cache
  });

  if (uploadResult.error || !uploadResult.data) {
    return {
      data: null,
      error: uploadResult.error
    };
  }

  const urlResult = typedStorage.getPublicUrl(bucket, uploadResult.data.path);
  
  if (urlResult.error || !urlResult.data) {
    return {
      data: null,
      error: urlResult.error
    };
  }

  return {
    data: {
      ...uploadResult.data,
      publicUrl: urlResult.data.publicUrl
    },
    error: null
  };
};

// Error boundary helper
export const handleStorageError = (error: StorageError | null): string => {
  if (!error) return '';
  
  // Return Spanish error message
  switch (error.code) {
    case 'UPLOAD_ERROR':
    case 'INVALID_FILE':
      return STORAGE_ERRORS.UPLOAD_FAILED;
    case 'DOWNLOAD_ERROR':
      return STORAGE_ERRORS.DOWNLOAD_FAILED;
    case 'DELETE_ERROR':
      return STORAGE_ERRORS.DELETE_FAILED;
    case 'LIST_ERROR':
      return STORAGE_ERRORS.LIST_FAILED;
    case 'FILE_NOT_FOUND':
      return STORAGE_ERRORS.FILE_NOT_FOUND;
    case 'PERMISSION_DENIED':
      return STORAGE_ERRORS.PERMISSION_DENIED;
    default:
      return STORAGE_ERRORS.UNKNOWN_ERROR;
  }
};
