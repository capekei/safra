import multer from "multer";
import { getCloudinaryService, type DominicanOptimizedOptions, type CloudinaryResult } from "./services/cloudinary.js";
import { handleStorageError } from './lib/helpers/dominican.js';

// Configure multer to use memory storage for Cloudinary
const storage = multer.memoryStorage();

// File filter optimized for Dominican Republic data constraints
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = {
    images: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    videos: ["video/mp4", "video/mpeg", "video/webm", "video/quicktime"],
  };

  const isImage = file.mimetype.startsWith("image/");
  const isVideo = file.mimetype.startsWith("video/");

  if (
    (isImage && allowedTypes.images.includes(file.mimetype)) ||
    (isVideo && allowedTypes.videos.includes(file.mimetype))
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// Configure multer with Dominican Republic optimizations
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Reduced to 10MB for Dominican 3G networks
  },
});

// Cloudinary upload service
export class UploadService {
  private cloudinary = getCloudinaryService();

  /**
   * Upload single image to Cloudinary with Dominican optimizations
   */
  async uploadImage(
    file: Express.Multer.File,
    options: DominicanOptimizedOptions = {}
  ): Promise<CloudinaryResult> {
    try {
      const isImage = file.mimetype.startsWith("image/");
      if (!isImage) {
        throw new Error("File must be an image");
      }

      // Dominican Republic specific optimizations
      const optimizedOptions: DominicanOptimizedOptions = {
        mobile3G: true, // Assume 3G by default in DR
        dataConstraints: 'strict', // Aggressive optimization for expensive data
        audience: 'mobile', // 70% mobile users
        folder: isImage ? 'safra-images' : 'safra-videos',
        ...options
      };

      return await this.cloudinary.uploadImage(file.buffer, optimizedOptions);
    } catch (error) {
      throw handleStorageError('UPLOAD_ERROR', 'Failed to upload image', error);
    }
  }

  /**
   * Upload multiple images with batch optimization for Dominican networks
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    options: DominicanOptimizedOptions = {}
  ): Promise<CloudinaryResult[]> {
    try {
      const imageFiles = files.filter(file => file.mimetype.startsWith("image/"));
      
      const imagesWithBuffers = imageFiles.map(file => ({
        buffer: file.buffer,
        filename: file.originalname
      }));

      const optimizedOptions: DominicanOptimizedOptions = {
        mobile3G: true,
        dataConstraints: 'strict',
        audience: 'mobile',
        folder: 'safra-images',
        ...options
      };

      return await this.cloudinary.uploadMultipleImages(imagesWithBuffers, optimizedOptions);
    } catch (error) {
      throw handleStorageError('UPLOAD_ERROR', 'Failed to upload multiple images', error);
    }
  }

  /**
   * Generate responsive image URL for different devices
   * Critical for Dominican Republic's mixed device ecosystem
   */
  getResponsiveImageUrl(
    publicId: string, 
    deviceType: 'mobile' | 'tablet' | 'desktop' = 'mobile'
  ): string {
    return this.cloudinary.generateResponsiveUrl(publicId, deviceType);
  }

  /**
   * Generate upload signature for direct client uploads
   * Reduces server load in Dominican Republic's infrastructure
   */
  generateUploadSignature(options: DominicanOptimizedOptions = {}) {
    return this.cloudinary.generateUploadSignature(options);
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    return this.cloudinary.deleteImage(publicId);
  }
}

// Export singleton instance
export const uploadService = new UploadService();

// Helper to get optimized file URLs for Dominican Republic
export const getFileUrl = (publicId: string, deviceType: 'mobile' | 'tablet' | 'desktop' = 'mobile'): string => {
  return uploadService.getResponsiveImageUrl(publicId, deviceType);
};

// Backward compatibility wrapper
export const getOptimizedImageUrl = getFileUrl;