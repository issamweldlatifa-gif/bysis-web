/**
 * DynamicColorCarousel — Amazon-style hero carousel
 *
 * Key behaviors (matching Amazon exactly):
 *  - Cards at ~88% width with peek of next card on the right
 *  - Snap-to-center with momentum
 *  - Colored background ONLY in the hero section (not the whole page)
 *  - Smooth color interpolation tied to scroll progress
 *  - Bold title top-left + 2×2 grid of product cards
 *  - Dot indicators at the bottom
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

/* ── Types ─────────────────────────────────────────────────────────────────── */
export interface CarouselSlide {
  color: string;
  textColor?: string;
  title: string;
  subtitle?: string;
  cards?: CarouselCard[];
  onClick?: () => void;
}

export interface CarouselCard {
  image?: string;
  label?: string;
  onClick?: () => void;
}

interface DynamicColorCarouselProps {
  slides: CarouselSlide[];
  onColorChange?: (color: string) => void;
}

/* ── Color helpers ─────────────────────────────────────────────────────────── */
function hexToRgb(hex: string): [number, number, number] {
  // Handle rgb() strings
  if (hex.startsWith('rgb')) {
    const m = hex.match(/\d+/g);
    if (m) return [+m[0], +m[1], +m[2]];
  }
  const c = hex.replace('#', '').padEnd(6, '0');
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function isLight(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function DynamicColorCarousel({ slides, onColorChange }: DynamicColorCarouselProps) {
  const [heroBg, setHeroBg] = useState(slides[0]?.color ?? '#f5c518');
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Autoplay: 4s delay, stops on user interaction
  const autoplay = Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',        // snap-to-center like Amazon
      skipSnaps: false,
      dragFree: false,
      containScroll: false,   // allow peek of adjacent slides
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
    onColorChange?.(color);
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, slides, onColorChange]);

  useEffect(() => {
    if (!emblaApi) return;

    setHeroBg(slides[0]?.color ?? '#f5c518');
    onColorChange?.(slides[0]?.color ?? '#f5c518');

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
  }, [emblaApi, syncColor, slides, onColorChange]);

  if (slides.length === 0) return null;

  return (
    /* Hero wrapper — ONLY this section has the colored background */
    <div
      className="w-full relative"
      style={{
        background: heroBg,
        // No transition here — color is interpolated in JS for smoothness
      }}
    >
      {/* Embla viewport — overflow visible to show peek of adjacent slides */}
      <div
        ref={emblaRef}
        className="overflow-hidden w-full"
        style={{ paddingLeft: '6%', paddingRight: '6%' }}
      >
        <div className="flex gap-3">
          {slides.map((slide, i) => {
            const light = isLight(slide.color);
            const titleColor = slide.textColor ?? (light ? '#0a0a0a' : '#ffffff');
            const subtitleColor = light ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.8)';
            const cardBorder = light ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)';

            return (
              <div
                key={i}
                className="relative flex-none select-none"
                style={{
                  // 88% width = peek of ~6% on each side
                  width: '88%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: slide.color,
                }}
                onClick={slide.onClick}
              >
                {/* ── Slide content ─────────────────────────────────────── */}
                <div className="px-4 pt-5 pb-4">
                  {/* Title */}
                  <h2
                    className="font-black leading-tight"
                    style={{
                      color: titleColor,
                      fontSize: 'clamp(1.5rem, 6.5vw, 2rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {slide.title}
                  </h2>

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p
                      className="mt-1.5 font-medium"
                      style={{
                        color: subtitleColor,
                        fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
                      }}
                    >
                      {slide.subtitle}
                    </p>
                  )}

                  {/* ── 2×2 Product Grid ──────────────────────────────── */}
                  <div className="grid grid-cols-2 gap-2.5 mt-4 mb-3">
                    {(slide.cards ?? Array(4).fill({})).slice(0, 4).map((card: CarouselCard, j: number) => (
                      <button
                        key={j}
                        onClick={(e) => { e.stopPropagation(); card.onClick?.(); }}
                        className="relative overflow-hidden active:scale-[0.96] transition-transform duration-150"
                        style={{
                          aspectRatio: '1 / 1',
                          borderRadius: '12px',
                          border: `2px solid ${cardBorder}`,
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
                          <div className="w-full h-full" />
                        )}
                        {card.label && (
                          <span
                            className="absolute bottom-1.5 left-1.5 right-1.5 text-xs font-semibold text-center truncate"
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
        {slides.map((_, i) => {
          const activeBg = isLight(slides[activeIndex]?.color ?? '#fff');
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                height: '3px',
                width: i === activeIndex ? '20px' : '6px',
                borderRadius: '2px',
                backgroundColor:
                  i === activeIndex
                    ? activeBg ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.95)'
                    : activeBg ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.38)',
                transition: 'width 0.25s cubic-bezier(0.23,1,0.32,1)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
