/**
 * Progressive Loading Image Component for SafraReport
 * Optimized for Dominican Republic's 3G networks and expensive data plans
 * Provides WebP/AVIF support with JPEG fallbacks
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DominicanImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: 'low' | 'medium' | 'high';
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

interface CloudinaryTransform {
  width?: number;
  height?: number;
  quality: 'auto:low' | 'auto:good' | 'auto:best';
  format: 'auto' | 'webp' | 'jpg';
  dpr: 'auto' | 1 | 2;
  crop?: 'fill' | 'fit' | 'scale';
  flags?: string[];
}

export const DominicanImage: React.FC<DominicanImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  quality = 'low', // Default to aggressive compression for DR
  deviceType = 'mobile',
  placeholder = 'blur',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Dominican Republic mobile-first optimizations
  const getDominicanTransforms = (): CloudinaryTransform => {
    const baseTransforms: CloudinaryTransform = {
      format: 'auto', // WebP when supported, JPEG fallback
      dpr: 'auto',
      flags: ['progressive'] // Progressive JPEG for better perceived loading
    };

    // Quality settings optimized for expensive Dominican data plans
    switch (quality) {
      case 'low':
        baseTransforms.quality = 'auto:low';
        break;
      case 'medium':
        baseTransforms.quality = 'auto:good';
        break;
      case 'high':
        baseTransforms.quality = 'auto:best';
        break;
    }

    // Device-specific optimizations
    switch (deviceType) {
      case 'mobile':
        return {
          ...baseTransforms,
          width: Math.min(width || 400, 400),
          height: Math.min(height || 300, 300),
          crop: 'fill',
          quality: 'auto:low' // Force low quality for mobile
        };
      case 'tablet':
        return {
          ...baseTransforms,
          width: Math.min(width || 600, 600),
          height: Math.min(height || 450, 450),
          crop: 'fill',
          quality: quality === 'high' ? 'auto:good' : 'auto:low'
        };
      case 'desktop':
        return {
          ...baseTransforms,
          width: width || 800,
          height: height || 600,
          crop: 'fit'
        };
      default:
        return baseTransforms;
    }
  };

  // Generate optimized Cloudinary URL
  const generateOptimizedUrl = (publicId: string, transforms: CloudinaryTransform): string => {
    if (!publicId.includes('cloudinary.com')) {
      // Not a Cloudinary URL, return as-is
      return publicId;
    }

    try {
      const baseUrl = publicId.split('/upload/')[0] + '/upload/';
      const imagePath = publicId.split('/upload/')[1];
      
      const transformParts: string[] = [];
      
      if (transforms.width) transformParts.push(`w_${transforms.width}`);
      if (transforms.height) transformParts.push(`h_${transforms.height}`);
      if (transforms.quality) transformParts.push(`q_${transforms.quality}`);
      if (transforms.format) transformParts.push(`f_${transforms.format}`);
      if (transforms.dpr) transformParts.push(`dpr_${transforms.dpr}`);
      if (transforms.crop) transformParts.push(`c_${transforms.crop}`);
      if (transforms.flags) {
        transformParts.push(...transforms.flags.map(flag => `fl_${flag}`));
      }
      
      return `${baseUrl}${transformParts.join(',')}/v1/${imagePath}`;
    } catch (error) {
      console.warn('Failed to optimize image URL:', error);
      return publicId;
    }
  };

  // Generate progressive loading URLs (low quality preview + full quality)
  const getProgressiveUrls = () => {
    const transforms = getDominicanTransforms();
    
    const previewTransforms: CloudinaryTransform = {
      ...transforms,
      width: Math.floor((transforms.width || 400) * 0.1), // 10% size for preview
      quality: 'auto:low',
      format: 'jpg' // JPEG for faster preview loading
    };

    return {
      preview: generateOptimizedUrl(src, previewTransforms),
      full: generateOptimizedUrl(src, transforms)
    };
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Progressive loading logic
  useEffect(() => {
    if (!isInView) return;

    const { preview, full } = getProgressiveUrls();
    
    // Load preview first for faster perceived loading
    const previewImg = new Image();
    previewImg.onload = () => {
      setCurrentSrc(preview);
      
      // Then load full quality image
      const fullImg = new Image();
      fullImg.onload = () => {
        setCurrentSrc(full);
        setIsLoaded(true);
        onLoad?.();
      };
      fullImg.onerror = () => {
        setHasError(true);
        onError?.();
      };
      fullImg.src = full;
    };
    
    previewImg.onerror = () => {
      // If preview fails, try loading full image directly
      setCurrentSrc(full);
    };
    previewImg.src = preview;
    
  }, [isInView, src]);

  // Error fallback
  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-200 text-gray-500',
          'min-h-[200px] text-sm',
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
          <p>Error cargando imagen</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {/* Placeholder while loading */}
      {(!isLoaded || !currentSrc) && placeholder === 'blur' && (
        <div 
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300',
            'animate-pulse'
          )}
        />
      )}
      
      {/* Main image */}
      {(isInView || priority) && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            'w-full h-full object-cover'
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => {
            setHasError(true);
            onError?.();
          }}
        />
      )}
      
      {/* Loading indicator for Dominican users */}
      {!isLoaded && isInView && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>Cargando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Utility hook for detecting device type
export const useDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
};

// Dominican-optimized image gallery component
interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export const DominicanImageGallery: React.FC<ImageGalleryProps> = ({ images, className }) => {
  const deviceType = useDeviceType();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main image */}
      <DominicanImage
        src={images[selectedIndex]}
        alt={`Imagen ${selectedIndex + 1} de ${images.length}`}
        deviceType={deviceType}
        quality="medium"
        className="w-full aspect-video"
        priority={selectedIndex === 0}
      />
      
      {/* Thumbnail navigation - Dominican mobile optimized */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors',
                selectedIndex === index ? 'border-blue-500' : 'border-gray-300'
              )}
            >
              <DominicanImage
                src={image}
                alt={`Miniatura ${index + 1}`}
                deviceType="mobile"
                quality="low"
                className="w-full h-full"
                placeholder="empty"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DominicanImage;