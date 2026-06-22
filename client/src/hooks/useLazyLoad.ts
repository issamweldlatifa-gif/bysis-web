/**
 * useLazyLoad Hook — Lazy loading avec Intersection Observer
 */
import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
  rootMargin?: string;
  threshold?: number | number[];
  priority?: boolean;
}

export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    priority = false,
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(priority);

  useEffect(() => {
    if (priority || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [priority, rootMargin, threshold]);

  return { ref, isVisible };
}

/**
 * useImagePreload Hook — Précharge les images
 */
export function useImagePreload(src: string) {
  useEffect(() => {
    const img = new Image();
    img.src = src;
  }, [src]);
}

/**
 * useVideoPreload Hook — Précharge les vidéos
 */
export function useVideoPreload(src: string) {
  useEffect(() => {
    const video = document.createElement('video');
    video.src = src;
    video.preload = 'metadata';
  }, [src]);
}
