/**
 * OptimizedImage Component — Image avec lazy loading et optimisations
 * Supporte srcset, lazy loading, et placeholder blur
 */
import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  srcSet?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  blurDataUrl?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  srcSet,
  sizes,
  priority = false,
  onLoad,
  blurDataUrl,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(priority ? src : null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setImageSrc(src);
      return;
    }

    // Intersection Observer pour lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            if (imgRef.current) {
              observer.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Charger 50px avant d'être visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : 'auto',
      }}
    >
      {/* Placeholder blur (optionnel) */}
      {blurDataUrl && !isLoaded && (
        <img
          src={blurDataUrl}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover blur-md"
          aria-hidden="true"
        />
      )}

      {/* Image principale */}
      <img
        ref={imgRef}
        src={imageSrc || undefined}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}
