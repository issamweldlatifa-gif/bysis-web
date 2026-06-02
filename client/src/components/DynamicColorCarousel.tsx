/**
 * DynamicColorCarousel — Amazon-style hero carousel
 *
 * Key behaviors:
 *  - Cards at 80% width, PERFECTLY CENTERED
 *  - Equal peek: ~10% visible on BOTH left AND right sides
 *  - scroll-snap-type: x mandatory + scroll-snap-align: center
 *  - Smooth color interpolation tied to scroll progress
 *  - Bold title top-left + 2×2 grid of product cards
 *  - Dot indicators at the bottom
 *  - onColorChange fires on every scroll for header sync
 */

import { useEffect, useRef, useCallback, useState } from 'react';

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
  const [heroBg, setHeroBg]       = useState(slides[0]?.color ?? '#f5c518');
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number | null>(null);

  /* ── Sync hero background color with scroll progress ─────────────────── */
  const syncColor = useCallback(() => {
    const el = scrollRef.current;
    if (!el || slides.length === 0) return;

    // Card width = 80% of container, gap between cards = 12px
    const containerWidth = el.clientWidth;
    const cardWidth      = containerWidth * 0.80;
    const gap            = 12;
    const peekWidth      = (containerWidth - cardWidth) / 2;

    // scrollLeft when card i is centered = i * (cardWidth + gap)
    const scrollLeft = el.scrollLeft;
    const cardStep   = cardWidth + gap;

    // Fractional index
    const rawIndex = scrollLeft / cardStep;
    const fromIdx  = Math.max(0, Math.floor(rawIndex));
    const toIdx    = Math.min(fromIdx + 1, slides.length - 1);
    const t        = rawIndex - fromIdx;

    const color = lerpColor(slides[fromIdx].color, slides[toIdx].color, t);
    setHeroBg(color);
    onColorChange?.(color);

    // Active index = nearest
    const nearest = Math.round(rawIndex);
    setActiveIndex(Math.max(0, Math.min(nearest, slides.length - 1)));
  }, [slides, onColorChange]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Fire initial color
    onColorChange?.(slides[0]?.color ?? '#f5c518');

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(syncColor);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [syncColor, slides, onColorChange]);

  if (slides.length === 0) return null;

  return (
    /* Hero wrapper — colored background matches active slide */
    <div
      className="w-full relative"
      style={{ background: heroBg }}
    >
      {/* Scroll container: overflow-x scroll, snap mandatory */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingTop: '16px',
          paddingBottom: '0px',
          /* scroll-padding-inline ensures snap points align to center */
          scrollPaddingInline: '10%',
        } as React.CSSProperties}
      >
        {/* Hide scrollbar webkit */}
        <style>{`.carousel-scroll::-webkit-scrollbar { display: none; }`}</style>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            width: 'fit-content',
            /* Equal padding on both sides so first/last cards can center */
            paddingLeft: '10%',
            paddingRight: '10%',
          }}
        >
          {slides.map((slide, i) => {
            const light        = isLight(slide.color);
            const titleColor   = slide.textColor ?? (light ? '#0a0a0a' : '#ffffff');
            const subtitleColor = light ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.8)';
            const cardBorder   = light ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)';

            return (
              <div
                key={i}
                className="relative flex-none select-none"
                style={{
                  /* 80% of viewport width — equal peek on both sides */
                  width: '80vw',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  backgroundColor: slide.color,
                  scrollSnapAlign: 'center',
                  scrollSnapStop: 'always',
                }}
                onClick={slide.onClick}
              >
                {/* Content */}
                <div className="p-5 pb-3">
                  <h2
                    className="text-2xl font-black leading-tight mb-1 whitespace-pre-wrap"
                    style={{ color: titleColor }}
                  >
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="text-sm font-medium mb-4" style={{ color: subtitleColor }}>
                      {slide.subtitle}
                    </p>
                  )}
                </div>

                {/* 2×2 grid */}
                {slide.cards && slide.cards.length > 0 && (
                  <div className="px-4 pb-5 grid grid-cols-2 gap-2.5">
                    {slide.cards.slice(0, 4).map((card, ci) => (
                      <div
                        key={ci}
                        className="aspect-square rounded-2xl flex items-end justify-start p-2.5"
                        style={{
                          border: `1.5px solid ${cardBorder}`,
                          background: 'transparent',
                        }}
                        onClick={card.onClick}
                      >
                        {card.image && (
                          <img
                            src={card.image}
                            alt={card.label}
                            className="w-full h-full object-cover absolute inset-0 rounded-2xl"
                          />
                        )}
                        {card.label && (
                          <span
                            className="text-xs font-bold relative z-10"
                            style={{ color: titleColor }}
                          >
                            {card.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 py-3">
        {slides.map((_, i) => (
          <div
            key={i}
            style={{
              width:  i === activeIndex ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === activeIndex
                ? (isLight(heroBg) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)')
                : (isLight(heroBg) ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.35)'),
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
