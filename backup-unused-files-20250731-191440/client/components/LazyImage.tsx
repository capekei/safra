import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: string;
}

/**
 * Optimized lazy loading image component for SafraReport Dominican marketplace
 * Improves performance for mobile users with slower connections
 */
export function LazyImage({ 
  src, 
  alt, 
  className, 
  placeholder,
  fallback = '/placeholder-image.svg',
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); // Show fallback
  };

  // Generate placeholder SVG for better performance
  const placeholderSrc = placeholder || 
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="#9ca3af">
          Cargando...
        </text>
      </svg>`
    )}`;

  const actualSrc = hasError ? fallback : (isInView ? src : placeholderSrc);

  return (
    <img
      ref={imgRef}
      src={actualSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300 ease-in-out',
        !isLoaded && 'opacity-70',
        isLoaded && 'opacity-100',
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}

// Specialized component for Dominican marketplace article images
export function ArticleImage({ 
  src, 
  alt, 
  className,
  aspectRatio = 'aspect-video'
}: LazyImageProps & { aspectRatio?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-lg bg-gray-100', aspectRatio)}>
      <LazyImage
        src={src}
        alt={alt}
        className={cn('w-full h-full object-cover hover:scale-105 transition-transform duration-200', className)}
        placeholder={`data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9">
            <rect width="16" height="9" fill="#f3f4f6"/>
            <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="1" fill="#9ca3af">
              SafraReport
            </text>
          </svg>`
        )}`}
      />
    </div>
  );
}

// Profile image component for Dominican users
export function ProfileImage({ 
  src, 
  alt, 
  size = 'md',
  className 
}: LazyImageProps & { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn('rounded-full overflow-hidden bg-gray-100', sizeClasses[size])}>
      <LazyImage
        src={src}
        alt={alt}
        className={cn('w-full h-full object-cover', className)}
        placeholder={`data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1">
            <circle cx="0.5" cy="0.5" r="0.5" fill="#e5e7eb"/>
            <text x="50%" y="50%" text-anchor="middle" dy="0.1em" font-family="Arial" font-size="0.3" fill="#9ca3af">
              👤
            </text>
          </svg>`
        )}`}
      />
    </div>
  );
}