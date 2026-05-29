import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';

/* ── Carousel Images (4 colors) ───────────────────────────────────────────── */
const CAROUSEL_IMAGES = useMemo(() => [
  {
    url: '/manus-storage/PublicationInstagramPrisedeRendez-VousInstitutMinimalisteBeigeMarronNoir_0bce6d06.png',
    bgColor: '#B8E6A0',
    label: 'Collection Verte'
  },
  {
    url: '/manus-storage/PublicationInstagramPrisedeRendez-VousInstitutMinimalisteBeigeMarronNoir_01_39d923ba.png',
    bgColor: '#17A2B8',
    label: 'Collection Bleue'
  },
  {
    url: '/manus-storage/PublicationInstagramPrisedeRendez-VousInstitutMinimalisteBeigeMarronNoir_02_f8a07893.png',
    bgColor: '#FF5252',
    label: 'Collection Rouge'
  },
  {
    url: '/manus-storage/PublicationInstagramPrisedeRendez-VousInstitutMinimalisteBeigeMarronNoir_03_f78e6c6a.png',
    bgColor: '#003D82',
    label: 'Collection Marine'
  }
], []);

/* ── Home Component ───────────────────────────────────────────────────────── */
function HomeContent() {
  const { setBgColor } = useBgColor();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastScrollRef = useRef<number>(0);

  const currentImage = CAROUSEL_IMAGES[currentIndex];

  // Set background color on mount and when index changes
  useEffect(() => {
    setBgColor(currentImage.bgColor);
  }, [currentIndex, setBgColor, currentImage.bgColor]);

  // Optimized scroll handler with RAF throttling
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    // Cancel previous RAF if pending
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollLeft = container.scrollLeft;
      const itemWidth = container.offsetWidth;
      const newIndex = Math.round(scrollLeft / itemWidth);
      
      // Only update if index actually changed
      if (newIndex !== currentIndex && newIndex < CAROUSEL_IMAGES.length) {
        setCurrentIndex(newIndex);
      }
      lastScrollRef.current = scrollLeft;
    });
  }, [currentIndex, CAROUSEL_IMAGES.length]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Dot click handler
  const handleDotClick = useCallback((idx: number) => {
    if (!scrollContainerRef.current) return;
    const itemWidth = scrollContainerRef.current.offsetWidth;
    scrollContainerRef.current.scrollTo({
      left: itemWidth * idx,
      behavior: 'smooth'
    });
    setCurrentIndex(idx);
  }, []);

  return (
    <div className="w-full">
      {/* HORIZONTAL SCROLL CAROUSEL — snap-to-center */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto snap-x snap-mandatory"
        style={{
          aspectRatio: '3/4',
          maxHeight: '55vh',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
        onScroll={handleScroll}
      >
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        
        <div className="flex" style={{ width: `${CAROUSEL_IMAGES.length * 100}%` }}>
          {CAROUSEL_IMAGES.map((item, idx) => (
            <div
              key={idx}
              className="snap-center snap-always flex-shrink-0"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img
                src={item.url}
                alt={item.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  background: item.bgColor
                }}
                loading={idx === 0 ? 'eager' : 'lazy'}
                crossOrigin="anonymous"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>

      {/* DOT INDICATORS */}
      <div className="flex justify-center gap-2 py-4 bg-white">
        {CAROUSEL_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-black w-6' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* SECTION BELOW */}
      <section className="w-full py-10 px-5 text-center bg-white">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
          Pourquoi choisir Bysis?
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
          Votre partenaire de confiance pour vos achats en ligne
        </p>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <AppLayout>
      <HomeContent />
    </AppLayout>
  );
}
