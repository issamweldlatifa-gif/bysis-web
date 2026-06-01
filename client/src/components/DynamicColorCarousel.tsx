/**
 * DynamicColorCarousel — Amazon-style hero carousel
 *
 * Design (matching provided screenshots exactly):
 *  - Full colored background (yellow / green / dark-blue)
 *  - Bold large title top-left
 *  - Smaller subtitle below title
 *  - 2×2 grid of white-bordered rounded cards (product placeholders)
 *  - Smooth color interpolation tied to scroll progress
 *  - Dot indicators at the bottom
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

/* ── Types ─────────────────────────────────────────────────────────────────── */
export interface CarouselSlide {
  color: string;           // background color hex
  textColor?: string;      // title/subtitle color (defaults to black or white based on bg)
  title: string;
  subtitle?: string;
  cards?: CarouselCard[];  // 4 product cards in 2×2 grid
  onClick?: () => void;
}

export interface CarouselCard {
  image?: string;
  label?: string;
  onClick?: () => void;
}

interface DynamicColorCarouselProps {
  slides: CarouselSlide[];
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

/** Determine if a hex color is "light" so we can pick black or white text */
function isLight(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  // Perceived luminance formula
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function DynamicColorCarousel({ slides }: DynamicColorCarouselProps) {
  const [heroBg, setHeroBg] = useState(slides[0]?.color ?? '#f5c518');
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

    setHeroBg(slides[0]?.color ?? '#f5c518');

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
    <div
      className="w-full relative overflow-hidden"
      style={{ background: heroBg, transition: 'background 0.12s ease-out' }}
    >
      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden w-full">
        <div className="flex">
          {slides.map((slide, i) => {
            const light = isLight(slide.color);
            const titleColor = slide.textColor ?? (light ? '#0a0a0a' : '#ffffff');
            const subtitleColor = light ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.8)';
            const cardBorder = light ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)';

            return (
              <div
                key={i}
                className="relative flex-none w-full select-none"
                style={{ backgroundColor: slide.color }}
                onClick={slide.onClick}
              >
                {/* ── Slide content ─────────────────────────────────────── */}
                <div className="px-4 pt-5 pb-4">
                  {/* Title */}
                  <h2
                    className="font-black leading-tight"
                    style={{
                      color: titleColor,
                      fontSize: 'clamp(1.6rem, 7vw, 2.2rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                    }}
                  >
                    {slide.title}
                  </h2>

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p
                      className="mt-1 font-medium"
                      style={{
                        color: subtitleColor,
                        fontSize: 'clamp(0.85rem, 3.5vw, 1rem)',
                      }}
                    >
                      {slide.subtitle}
                    </p>
                  )}

                  {/* ── 2×2 Product Grid ──────────────────────────────── */}
                  <div className="grid grid-cols-2 gap-3 mt-5 mb-2">
                    {(slide.cards ?? Array(4).fill({})).slice(0, 4).map((card: CarouselCard, j: number) => (
                      <button
                        key={j}
                        onClick={(e) => {
                          e.stopPropagation();
                          card.onClick?.();
                        }}
                        className="relative overflow-hidden active:scale-[0.97] transition-transform duration-150"
                        style={{
                          aspectRatio: '1 / 1',
                          borderRadius: '14px',
                          border: `2.5px solid ${cardBorder}`,
                          backgroundColor: 'transparent',
                        }}
                      >
                        {card.image ? (
                          <img
                            src={card.image}
                            alt={card.label ?? `Product ${j + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                          />
                        ) : (
                          /* Empty placeholder — matches the screenshots exactly */
                          <div className="w-full h-full" />
                        )}
                        {card.label && (
                          <span
                            className="absolute bottom-2 left-2 right-2 text-xs font-semibold text-center truncate"
                            style={{ color: titleColor }}
                          >
                            {card.label}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Dot indicators ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1.5 py-3">
        {slides.map((_, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              height: '3px',
              width: i === activeIndex ? '22px' : '6px',
              borderRadius: '2px',
              backgroundColor:
                i === activeIndex
                  ? isLight(slides[activeIndex]?.color ?? '#fff')
                    ? 'rgba(0,0,0,0.7)'
                    : 'rgba(255,255,255,0.95)'
                  : isLight(slides[activeIndex]?.color ?? '#fff')
                  ? 'rgba(0,0,0,0.25)'
                  : 'rgba(255,255,255,0.4)',
              transition: 'width 0.25s cubic-bezier(0.23,1,0.32,1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
