import { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';

/* ── Dominant color extracted from boutique image ────────────────────────── */
// python3: Average color = #8d847c (warm gray/beige)
const HERO_COLOR = '#8d847c';
const HERO_IMG = '/manus-storage/BluePlayfulTypographicComingSoonFashionPoster-3_47ac2e8d.png';

/* ── Home Component ───────────────────────────────────────────────────────── */
function HomeContent() {
  const { setBgColor } = useBgColor();

  useEffect(() => {
    setBgColor(HERO_COLOR);
  }, []);

  return (
    <div className="w-full">
      {/* HERO IMAGE — full width, no gap */}
      <div className="w-full" style={{ aspectRatio: '3/4', maxHeight: '75vh', overflow: 'hidden' }}>
        <img
          src={HERO_IMG}
          alt="Bysis - Nouvelle Collection"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="eager"
        />
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
