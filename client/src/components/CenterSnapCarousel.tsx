/**
 * CenterSnapCarousel — Professional center-aligned carousel
 * - scroll-snap-type: x mandatory
 * - Active card: 80% viewport width, perfectly centered
 * - Equal peeking: slivers of previous/next cards visible on both sides
 * - Emits onActiveCardChange(color, cardId) for header background sync
 */

import { useRef, useEffect, useState, ReactNode } from 'react';

export interface CarouselCard {
  id: string;
  color: string;
  title: string;
  subtitle?: string;
  content?: ReactNode;
}

interface CenterSnapCarouselProps {
  cards: CarouselCard[];
  onActiveCardChange?: (color: string, cardId: string) => void;
}

export default function CenterSnapCarousel({ cards, onActiveCardChange }: CenterSnapCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCardId, setActiveCardId] = useState<string>(cards[0]?.id || '');

  // Calculate dimensions
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const cardWidth = viewportWidth * 0.8; // 80% of viewport
  const peekWidth = (viewportWidth - cardWidth) / 2; // Equal space on each side

  // Intersection Observer to detect active card (the one most centered)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the card with highest intersection ratio (most centered)
        let mostCenteredEntry = entries[0];
        for (const entry of entries) {
          if (entry.intersectionRatio > (mostCenteredEntry?.intersectionRatio || 0)) {
            mostCenteredEntry = entry;
          }
        }

        if (mostCenteredEntry && mostCenteredEntry.isIntersecting) {
          const cardId = mostCenteredEntry.target.getAttribute('data-card-id');
          const cardColor = mostCenteredEntry.target.getAttribute('data-card-color');
          if (cardId && cardColor) {
            setActiveCardId(cardId);
            onActiveCardChange?.(cardColor, cardId);
          }
        }
      },
      {
        root: container,
        threshold: [0, 0.25, 0.5, 0.75, 1], // Multiple thresholds for accurate detection
      }
    );

    // Observe all cards
    const cardElements = container.querySelectorAll('[data-card-id]');
    cardElements.forEach((card) => observer.observe(card));

    return () => {
      cardElements.forEach((card) => observer.unobserve(card));
    };
  }, [cards, onActiveCardChange]);

  return (
    <div
      ref={scrollContainerRef}
      className="w-screen overflow-x-auto"
      style={{
        scrollBehavior: 'smooth',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {/* Hide scrollbar */}
      <style>{`
        div[data-carousel-scroll]::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          width: 'fit-content',
          gap: '0px',
        }}
      >
        {/* Left padding to center first card */}
        <div style={{ width: peekWidth, flexShrink: 0 }} />

        {/* Cards */}
        {cards.map((card) => (
          <div
            key={card.id}
            data-card-id={card.id}
            data-card-color={card.color}
            className="flex-shrink-0 rounded-3xl overflow-hidden shadow-lg"
            style={{
              width: cardWidth,
              height: 'auto',
              minHeight: '500px',
              background: card.color,
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
              marginRight: '0px',
            } as React.CSSProperties}
          >
            <div className="w-full h-full flex flex-col justify-between p-8 text-white">
              {/* Title & Subtitle */}
              <div>
                <h2 className="text-3xl font-black leading-tight mb-2 whitespace-pre-wrap">
                  {card.title}
                </h2>
                {card.subtitle && (
                  <p className="text-lg font-medium opacity-90">{card.subtitle}</p>
                )}
              </div>

              {/* Content */}
              {card.content && (
                <div className="flex-1 flex items-center justify-center">
                  {card.content}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Right padding to center last card */}
        <div style={{ width: peekWidth, flexShrink: 0 }} />
      </div>
    </div>
  );
}
