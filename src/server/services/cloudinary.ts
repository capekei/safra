/**
 * Cloudinary Service for SafraReport
 * Optimized for Dominican Republic's expensive data plans (RD$500-1000/month)
 * 70% mobile users on 3G networks require aggressive optimization
 */

import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { handleStorageError } from '../lib/helpers/dominican';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  quality?: 'auto:low' | 'auto:good' | 'auto:best' | number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  progressive?: boolean;
}

export interface DominicanOptimizedOptions extends UploadOptions {
  // Dominican Republic specific optimizations
  mobile3G?: boolean;
  dataConstraints?: 'strict' | 'moderate' | 'relaxed';
  audience?: 'mobile' | 'desktop' | 'mixed';
}

export interface CloudinaryResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  url: string;
  original_filename?: string;
}

export class CloudinaryService {
  private initialized = false;

  constructor(config: CloudinaryConfig) {
    this.initializeCloudinary(config);
  }

  private initializeCloudinary(config: CloudinaryConfig): void {
    try {
      cloudinary.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        api_secret: config.apiSecret,
        secure: true, // Always use HTTPS for Dominican Republic
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Cloudinary:', error);
      throw new Error('Cloudinary initialization failed');
    }
  }

  /**
   * Upload image with Dominican Republic optimizations
   * Automatically applies best settings for 3G mobile users
   */
  async uploadImage(
    buffer: Buffer,
    options: DominicanOptimizedOptions = {}
  ): Promise<CloudinaryResult> {
    if (!this.initialized) {
      throw new Error('Cloudinary service not initialized');
    }

    try {
      // Apply Dominican Republic optimizations
      const optimizedOptions = this.getDominicanOptimizations(options);
      
      // Pre-process image with Sharp for additional optimization
      const processedBuffer = await this.preprocessImage(buffer, optimizedOptions);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            ...optimizedOptions,
            // Dominican Republic specific settings
            flags: ['progressive'], // Progressive JPEG for faster perceived loading
            fetch_format: 'auto', // Auto WebP/AVIF for supported browsers
            quality: optimizedOptions.quality || 'auto:low', // Aggressive compression for 3G
            dpr: 'auto', // Auto device pixel ratio
            responsive: true, // Responsive breakpoints
            // Generate multiple sizes for different screens
            responsive_breakpoints: [
              { max_width: 320, max_images: 3 }, // Mobile portrait
              { max_width: 480, max_images: 3 }, // Mobile landscape  
              { max_width: 768, max_images: 3 }, // Tablet
              { max_width: 1024, max_images: 2 } // Desktop (fewer variants)
            ]
          },
          (error, result) => {
            if (error) {
              reject(handleStorageError('UPLOAD_ERROR', 'Failed to upload to Cloudinary', error));
            } else if (result) {
              resolve(result as CloudinaryResult);
            } else {
              reject(new Error('Upload completed but no result returned'));
            }
          }
        );

        uploadStream.end(processedBuffer);
      });
    } catch (error) {
      throw handleStorageError('UPLOAD_ERROR', 'Failed to upload image', error);
    }
  }

  /**
   * Upload multiple images optimized for Dominican Republic data constraints
   */
  async uploadMultipleImages(
    images: { buffer: Buffer; filename: string }[],
    options: DominicanOptimizedOptions = {}
  ): Promise<CloudinaryResult[]> {
    // Process images sequentially to avoid overwhelming 3G connections
    const results: CloudinaryResult[] = [];
    
    for (const image of images) {
      const result = await this.uploadImage(image.buffer, {
        ...options,
        public_id: image.filename.split('.')[0],
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Generate optimized URLs for different device types
   * Critical for Dominican Republic's mixed device ecosystem
   */
  generateResponsiveUrl(publicId: string, deviceType: 'mobile' | 'tablet' | 'desktop' = 'mobile'): string {
    const baseTransformations = this.getDeviceOptimizations(deviceType);
    
    return cloudinary.url(publicId, {
      ...baseTransformations,
      secure: true,
      sign_url: false, // Don't sign URLs for better caching
    });
  }

  /**
   * Get Dominican Republic specific optimizations based on context
   */
  private getDominicanOptimizations(options: DominicanOptimizedOptions): any {
    const { 
      mobile3G = true, 
      dataConstraints = 'strict', 
      audience = 'mobile',
      ...baseOptions 
    } = options;

    let optimizations: any = {
      ...baseOptions,
      folder: baseOptions.folder || 'safra-dr',
    };

    // Dominican Republic specific optimizations
    if (mobile3G || audience === 'mobile') {
      optimizations = {
        ...optimizations,
        quality: dataConstraints === 'strict' ? 'auto:low' : 'auto:good',
        format: 'auto', // WebP when supported, JPEG fallback
        width: Math.min(optimizations.width || 800, 800), // Max 800px width
        height: Math.min(optimizations.height || 600, 600), // Max 600px height
        crop: 'fill',
        flags: ['progressive', 'immutable_cache'], // Better caching for slow connections
      };
    }

    // Data constraint optimizations
    if (dataConstraints === 'strict') {
      optimizations.quality = 'auto:low';
      optimizations.width = Math.min(optimizations.width || 600, 600);
      optimizations.format = 'webp'; // Force WebP for better compression
    } else if (dataConstraints === 'moderate') {
      optimizations.quality = 'auto:good';
      optimizations.width = Math.min(optimizations.width || 1000, 1000);
    }

    return optimizations;
  }

  /**
   * Device-specific optimizations for Dominican Republic market
   */
  private getDeviceOptimizations(deviceType: 'mobile' | 'tablet' | 'desktop'): any {
    switch (deviceType) {
      case 'mobile':
        return {
          width: 400,
          height: 300,
          quality: 'auto:low',
          format: 'auto',
          crop: 'fill',
          dpr: 'auto',
          flags: ['progressive']
        };
      case 'tablet':
        return {
          width: 600,
          height: 450,
          quality: 'auto:good',
          format: 'auto',
          crop: 'fill',
          dpr: 'auto'
        };
      case 'desktop':
        return {
          width: 1000,
          height: 750,
          quality: 'auto:good',
          format: 'auto',
          crop: 'fit'
        };
      default:
        return this.getDeviceOptimizations('mobile');
    }
  }

  /**
   * Pre-process images with Sharp for additional optimization
   * Reduces upload time and bandwidth usage for Dominican users
   */
  private async preprocessImage(
    buffer: Buffer, 
    options: DominicanOptimizedOptions
  ): Promise<Buffer> {
    try {
      let sharpInstance = sharp(buffer);

      // Resize if dimensions specified
      if (options.width || options.height) {
        sharpInstance = sharpInstance.resize(options.width, options.height, {
          fit: options.crop === 'fill' ? 'cover' : 'inside',
          withoutEnlargement: true // Don't upscale images
        });
      }

      // Format conversion for better compression
      if (options.format === 'webp') {
        sharpInstance = sharpInstance.webp({ 
          quality: 80,
          effort: 6, // Higher compression effort
          smartSubsample: true 
        });
      } else if (options.format === 'jpg' || !options.format) {
        sharpInstance = sharpInstance.jpeg({ 
          quality: 85,
          progressive: true, // Progressive JPEG for better UX on 3G
          mozjpeg: true // Use mozjpeg for better compression
        });
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      console.warn('Image preprocessing failed, using original:', error);
      return buffer; // Fallback to original buffer
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw handleStorageError('DELETE_ERROR', `Failed to delete image: ${publicId}`, error);
    }
  }

  /**
   * Generate a signed upload URL for direct client uploads
   * Useful for reducing server load in Dominican Republic's infrastructure
   */
  generateUploadSignature(options: DominicanOptimizedOptions = {}): {
    signature: string;
    timestamp: number;
    api_key: string;
    cloud_name: string;
  } {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const optimizations = this.getDominicanOptimizations(options);
    
    const signature = cloudinary.utils.api_sign_request(
      { ...optimizations, timestamp },
      process.env.CLOUDINARY_API_SECRET!
    );

    return {
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY!,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!
    };
  }
}

// Export singleton instance
let cloudinaryService: CloudinaryService | null = null;

export const getCloudinaryService = (): CloudinaryService => {
  if (!cloudinaryService) {
    const config: CloudinaryConfig = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    };

    if (!config.cloudName || !config.apiKey || !config.apiSecret) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Cloudinary configuration missing - file uploads disabled in development');
        // Return a mock service for development
        return {} as CloudinaryService;
      }
      throw new Error('Missing Cloudinary configuration. Please check environment variables.');
    }

    cloudinaryService = new CloudinaryService(config);
  }

  return cloudinaryService;
};

export default getCloudinaryService;