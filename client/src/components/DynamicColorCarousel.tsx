/**
 * DynamicColorCarousel — Amazon Prime-style hero carousel
 *
 * Key behavior (matching Amazon exactly):
 *  - The HERO CONTAINER background changes color (not the whole page)
 *  - The rest of the page stays WHITE
 *  - Full-width slides, no card gaps — image fills the hero area
 *  - Smooth color interpolation tied to scroll progress
 *  - Dot indicators with active color matching current slide
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

/* ── Types ─────────────────────────────────────────────────────────────────── */
export interface CarouselSlide {
  image: string;
  color: string;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
}

interface DynamicColorCarouselProps {
  slides: CarouselSlide[];
  height?: string;
}

/* ── Color helpers ─────────────────────────────────────────────────────────── */
function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function DynamicColorCarousel({ slides, height = '52vw' }: DynamicColorCarouselProps) {
  const [heroBg, setHeroBg] = useState(slides[0]?.color ?? '#cadfe2');
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef<number | null>(null);

  const autoplay = Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
      containScroll: 'trimSnaps',
    },
    [autoplay]
  );

  /* ── Sync hero background color with scroll progress ─────────────────── */
  const syncColor = useCallback(() => {
    if (!emblaApi || slides.length === 0) return;

    const progress = emblaApi.scrollProgress(); // 0 → 1
    const total = slides.length;
    const raw = Math.max(0, Math.min(progress * (total - 1), total - 1.001));
    const from = Math.floor(raw);
    const to = Math.min(from + 1, total - 1);
    const t = raw - from;

    const color = lerpColor(slides[from].color, slides[to].color, t);
    setHeroBg(color);
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, slides]);

  useEffect(() => {
    if (!emblaApi) return;

    // Initial color
    setHeroBg(slides[0]?.color ?? '#cadfe2');

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
  }, [emblaApi, syncColor, slides]);

  if (slides.length === 0) return null;

  return (
    <div className="w-full relative overflow-hidden" style={{ background: heroBg, transition: 'background 0.15s ease-out' }}>
      {/* Embla viewport — full width, no padding */}
      <div ref={emblaRef} className="overflow-hidden w-full">
        <div className="flex">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative flex-none w-full cursor-pointer select-none"
              style={{ height }}
              onClick={slide.onClick}
            >
              {/* Slide background color (shows while image loads) */}
              <div className="absolute inset-0" style={{ backgroundColor: slide.color }} />

              {/* Full-bleed image */}
              <img
                src={slide.image}
                alt={slide.title ?? `Slide ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />

              {/* Bottom gradient for text */}
              {(slide.title || slide.subtitle) && (
                <>
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                    {slide.title && (
                      <p className="text-white font-bold text-xl leading-tight drop-shadow-lg">{slide.title}</p>
                    )}
                    {slide.subtitle && (
                      <p className="text-white/85 text-sm mt-0.5 drop-shadow">{slide.subtitle}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators — overlaid on bottom of hero */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
        {slides.map((_, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              height: '3px',
              width: i === activeIndex ? '22px' : '6px',
              borderRadius: '2px',
              backgroundColor: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)',
              transition: 'width 0.25s cubic-bezier(0.23,1,0.32,1), background-color 0.25s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
