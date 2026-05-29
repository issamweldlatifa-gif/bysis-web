import { useCallback, useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';
import { useImageColor } from '@/hooks/useImageColor';

/* ── Carousel Images (4 colors) ───────────────────────────────────────────── */
const CAROUSEL_IMAGES = [
  {
    url: '/manus-storage/PublicationInstagramPrisedeRendez-VousInstitutMinimalisteBeigeMarronNoir_0bce6d06.png',
    bgColor: '#B8E6A0', // Lime green
    label: 'Collection Verte'
  },
  {
    url: '/manus-storage/PublicationInstagramPrisedeRendez-VousInstitutMinimalisteBeigeMarronNoir_01_39d923ba.png',
    bgColor: '#17A2B8', // Teal/Cyan
    label: 'Collection Bleue'
  },
  {
    url: '/manus-storage/PublicationInstagramPrisedeRendez-VousInstitutMinimalisteBeigeMarronNoir_02_f8a07893.png',
    bgColor: '#FF5252', // Red
    label: 'Collection Rouge'
  },
  {
    url: '/manus-storage/PublicationInstagramPrisedeRendez-VousInstitutMinimalisteBeigeMarronNoir_03_f78e6c6a.png',
    bgColor: '#003D82', // Navy blue
    label: 'Collection Marine'
  }
];

/* ── Home Component ───────────────────────────────────────────────────────── */
function HomeContent() {
  const { setBgColor } = useBgColor();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentImage = CAROUSEL_IMAGES[currentIndex];

  // Set background color on mount and when index changes
  useEffect(() => {
    setBgColor(currentImage.bgColor);
  }, [currentIndex, setBgColor, currentImage.bgColor]);

  // Try dynamic extraction as fallback
  const handleColor = useCallback(
    (hex: string) => {
      setBgColor(hex);
    },
    [setBgColor]
  );

  useImageColor(currentImage.url, handleColor);

  // Handle scroll snapping
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);
    setCurrentIndex(Math.min(newIndex, CAROUSEL_IMAGES.length - 1));
  };

  return (
    <div className="w-full">
      {/* HORIZONTAL SCROLL CAROUSEL — snap-to-center */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{
          aspectRatio: '3/4',
          maxHeight: '55vh',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none', // Hide scrollbar on IE/Edge
          scrollbarWidth: 'none' // Hide scrollbar on Firefox
        }}
        onScroll={handleScroll}
      >
        <style>{`
          /* Hide scrollbar on Chrome/Safari */
          div::-webkit-scrollbar {
            display: none;
          }
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
            onClick={() => {
              if (scrollContainerRef.current) {
                const itemWidth = scrollContainerRef.current.offsetWidth;
                scrollContainerRef.current.scrollTo({
                  left: itemWidth * idx,
                  behavior: 'smooth'
                });
                setCurrentIndex(idx);
              }
            }}
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
