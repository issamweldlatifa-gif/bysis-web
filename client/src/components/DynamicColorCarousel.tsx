/**
 * DynamicColorCarousel — Amazon-style horizontal carousel
 * where the page background smoothly interpolates between
 * each slide's dominant color as the user scrolls.
 *
 * Technique:
 *  - Embla Carousel for smooth snap-scroll
 *  - On scroll progress, we interpolate between adjacent slide colors
 *    using the tweenProgress (0→1) from Embla's scroll API
 *  - setBgColor() updates the global CSS variable --app-bg-color
 *    which AppLayout already transitions with `transition-colors duration-500`
 */

import { useEffect, useRef, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useBgColor } from '@/contexts/BgColorContext';

/* ── Types ─────────────────────────────────────────────────────────────────── */
export interface CarouselSlide {
  /** Image URL */
  image: string;
  /** Dominant background color extracted from the image (hex) */
  color: string;
  /** Optional: section title */
  title?: string;
  /** Optional: subtitle */
  subtitle?: string;
  /** Optional: click handler */
  onClick?: () => void;
}

interface DynamicColorCarouselProps {
  slides: CarouselSlide[];
  /** Height of each slide card */
  slideHeight?: string;
  /** Title shown above the carousel */
  sectionTitle?: string;
}

/* ── Color helpers ─────────────────────────────────────────────────────────── */
/** Parse hex color → [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

/** Interpolate between two hex colors by t (0→1) */
function lerpColor(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Lighten a hex color by mixing with white */
function lightenColor(hex: string, amount: number): string {
  return lerpColor(hex, '#ffffff', amount);
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function DynamicColorCarousel({
  slides,
  slideHeight = '320px',
  sectionTitle,
}: DynamicColorCarouselProps) {
  const { setBgColor } = useBgColor();
  const rafRef = useRef<number | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    skipSnaps: false,
    dragFree: false,
  });

  /* ── Color sync on scroll ─────────────────────────────────────────────── */
  const syncColor = useCallback(() => {
    if (!emblaApi || slides.length === 0) return;

    const scrollProgress = emblaApi.scrollProgress(); // 0 → 1 across all slides
    const totalSlides = slides.length;

    // Map scroll progress to slide index + fractional part
    const rawIndex = scrollProgress * (totalSlides - 1);
    const fromIndex = Math.max(0, Math.min(Math.floor(rawIndex), totalSlides - 2));
    const toIndex = Math.min(fromIndex + 1, totalSlides - 1);
    const t = rawIndex - fromIndex; // 0 → 1 between two slides

    const fromColor = slides[fromIndex]?.color ?? '#cadfe2';
    const toColor = slides[toIndex]?.color ?? '#cadfe2';

    // Lighten slightly for a softer background feel (like Amazon)
    const interpolated = lerpColor(fromColor, toColor, t);
    const softened = lightenColor(interpolated, 0.25);

    setBgColor(softened);
  }, [emblaApi, slides, setBgColor]);

  /* ── Attach Embla listeners ──────────────────────────────────────────── */
  useEffect(() => {
    if (!emblaApi) return;

    // Set initial color
    if (slides.length > 0) {
      setBgColor(lightenColor(slides[0].color, 0.25));
    }

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(syncColor);
    };

    emblaApi.on('scroll', onScroll);
    emblaApi.on('settle', syncColor);
    emblaApi.on('select', syncColor);

    return () => {
      emblaApi.off('scroll', onScroll);
      emblaApi.off('settle', syncColor);
      emblaApi.off('select', syncColor);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [emblaApi, syncColor, slides, setBgColor]);

  if (slides.length === 0) return null;

  return (
    <section className="w-full py-4">
      {sectionTitle && (
        <h2 className="text-base font-bold text-gray-900 px-4 mb-3">{sectionTitle}</h2>
      )}

      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden w-full">
        <div className="flex gap-3 px-4">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative flex-none rounded-2xl overflow-hidden cursor-pointer select-none"
              style={{
                width: 'calc(85vw)',
                maxWidth: '340px',
                height: slideHeight,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
              onClick={slide.onClick}
            >
              {/* Background color layer — matches the slide's color */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: slide.color }}
              />

              {/* Image */}
              <img
                src={slide.image}
                alt={slide.title ?? `Slide ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />

              {/* Gradient overlay for text legibility */}
              {(slide.title || slide.subtitle) && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)',
                  }}
                />
              )}

              {/* Text overlay */}
              {(slide.title || slide.subtitle) && (
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {slide.title && (
                    <p className="text-white font-bold text-lg leading-tight drop-shadow">
                      {slide.title}
                    </p>
                  )}
                  {slide.subtitle && (
                    <p className="text-white/80 text-sm mt-0.5 drop-shadow">
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <DotIndicators emblaApi={emblaApi} count={slides.length} slides={slides} />
    </section>
  );
}

/* ── Dot Indicators ─────────────────────────────────────────────────────────── */
function DotIndicators({
  emblaApi,
  count,
  slides,
}: {
  emblaApi: ReturnType<typeof useEmblaCarousel>[1];
  count: number;
  slides: CarouselSlide[];
}) {
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emblaApi || !dotsRef.current) return;

    const updateDots = () => {
      const selected = emblaApi.selectedScrollSnap();
      const dots = dotsRef.current?.querySelectorAll<HTMLSpanElement>('[data-dot]');
      dots?.forEach((dot, i) => {
        const isActive = i === selected;
        dot.style.width = isActive ? '20px' : '6px';
        dot.style.opacity = isActive ? '1' : '0.4';
        dot.style.backgroundColor = isActive ? (slides[selected]?.color ?? '#1A1A1A') : '#1A1A1A';
      });
    };

    emblaApi.on('select', updateDots);
    emblaApi.on('reInit', updateDots);
    updateDots();

    return () => {
      emblaApi.off('select', updateDots);
      emblaApi.off('reInit', updateDots);
    };
  }, [emblaApi, slides]);

  return (
    <div ref={dotsRef} className="flex items-center justify-center gap-1.5 mt-3">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          data-dot
          style={{
            display: 'inline-block',
            height: '6px',
            width: i === 0 ? '20px' : '6px',
            borderRadius: '3px',
            backgroundColor: i === 0 ? (slides[0]?.color ?? '#1A1A1A') : '#1A1A1A',
            opacity: i === 0 ? 1 : 0.4,
            transition: 'width 0.25s ease, opacity 0.25s ease, background-color 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}
