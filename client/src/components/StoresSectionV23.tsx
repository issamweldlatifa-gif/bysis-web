/**
 * StoresSectionV23.tsx — Stores Section
 * 
 * Displays horizontal scrolling carousel of store cards.
 */

import React, { useRef } from 'react';

interface StoreCard {
  id: string;
  name: string;
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  link?: string;
}

interface StoresSectionProps {
  title?: string;
  stores?: StoreCard[];
}

export function StoresSectionV23({
  title = "Nos Boutiques",
  stores = [],
}: StoresSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  return (
    <section className="stores-section section">
      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>

      {/* Stores Slider */}
      <div
        className="stores-slider"
        ref={sliderRef}
        style={{
          display: 'flex',
          gap: '18px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          padding: '0 20px 18px',
          scrollbarWidth: 'none',
        }}
      >
        {stores.length > 0 ? (
          stores.map((store) => (
            <a
              key={store.id}
              href={store.link || '#'}
              className="store-column"
              style={{
                flex: '0 0 min(76vw, 360px)',
                minHeight: '220px',
                borderRadius: '22px',
                overflow: 'hidden',
                background: store.backgroundColor || '#f0f0f0',
                color: store.textColor || '#111418',
                padding: '28px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                scrollSnapAlign: 'start',
                textDecoration: 'none',
                position: 'relative',
                transition: 'transform 200ms ease-out',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              {/* Store Logo */}
              {store.logoUrl && (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain',
                  }}
                />
              )}

              {/* Store Name */}
              <div className="store-name">{store.name}</div>

              {/* Arrow Icon */}
              <div
                className="store-arrow"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `2px solid ${store.textColor || '#111418'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '12px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))
        ) : (
          <div
            style={{
              flex: '0 0 min(76vw, 360px)',
              minHeight: '220px',
              borderRadius: '22px',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '14px',
            }}
          >
            Aucune boutique disponible
          </div>
        )}
      </div>
    </section>
  );
}

export default StoresSectionV23;
