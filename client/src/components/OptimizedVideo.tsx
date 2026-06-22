/**
 * OptimizedVideo Component — Vidéo avec lazy loading et optimisations
 * Utilise Intersection Observer pour charger les vidéos à la demande
 */
import { useState, useEffect, useRef } from 'react';

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  priority?: boolean;
  onLoad?: () => void;
}

export default function OptimizedVideo({
  src,
  poster,
  className = '',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  priority = false,
  onLoad,
}: OptimizedVideoProps) {
  const [isVisible, setIsVisible] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (priority) {
      setIsVisible(true);
      return;
    }

    // Intersection Observer pour lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (videoRef.current) {
              observer.unobserve(videoRef.current);
            }
          }
        });
      },
      {
        rootMargin: '100px', // Charger 100px avant d'être visible
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [priority]);

  const handleLoadedData = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <video
      ref={videoRef}
      src={isVisible ? src : undefined}
      poster={poster}
      autoPlay={autoPlay && isVisible}
      muted={muted}
      loop={loop}
      controls={controls}
      onLoadedData={handleLoadedData}
      preload={isVisible ? 'auto' : 'none'}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
