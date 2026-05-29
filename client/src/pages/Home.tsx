import { useCallback, useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';
import { extractDominantColor } from '@/hooks/useImageColor';
import { useLocation } from 'wouter';
import { useChatContext } from '@/App';

// The 4 new product images uploaded by the user
const PRODUCT_IMAGES = [
  { src: '/manus-storage/product-green_84ad236a.png', label: 'Collection Verte', sub: 'Nouveauté printemps' },
  { src: '/manus-storage/product-teal_f635ee38.png',  label: 'Collection Bleue',  sub: 'Style urbain' },
  { src: '/manus-storage/product-red_2d4c0132.png',   label: 'Collection Rouge',  sub: 'Édition limitée' },
  { src: '/manus-storage/product-navy_3320c587.png',  label: 'Collection Marine', sub: 'Classique intemporel' },
];

function HomeContent() {
  const { setBgColor } = useBgColor();
  const [activeIdx, setActiveIdx] = useState(0);
  const [, navigate] = useLocation();
  const { openChat } = useChatContext();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const colorCache = useRef<Record<string, string>>({});

  // Pre-extract colors for all images on mount
  useEffect(() => {
    PRODUCT_IMAGES.forEach(({ src }) => {
      if (!colorCache.current[src]) {
        extractDominantColor(src).then((color) => {
          colorCache.current[src] = color;
        });
      }
    });
    // Set initial color
    extractDominantColor(PRODUCT_IMAGES[0].src).then((color) => {
      colorCache.current[PRODUCT_IMAGES[0].src] = color;
      setBgColor(color);
    });
  }, [setBgColor]);

  // IntersectionObserver: when an image enters viewport at 50%, update bg
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            setActiveIdx(idx);
            const src = PRODUCT_IMAGES[idx].src;
            const cached = colorCache.current[src];
            if (cached) {
              setBgColor(cached);
            } else {
              extractDominantColor(src).then((color) => {
                colorCache.current[src] = color;
                setBgColor(color);
              });
            }
          }
        }
      },
      { threshold: 0.5 }
    );
    itemRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [setBgColor]);

  return (
    <div className="w-full pb-24">
      {/* ── Scroll-based image gallery ── */}
      <div className="w-full snap-y snap-mandatory overflow-y-auto" style={{ height: '70vh' }}>
        {PRODUCT_IMAGES.map((img, idx) => (
          <div
            key={img.src}
            ref={(el) => { itemRefs.current[idx] = el; }}
            data-idx={idx}
            className="w-full snap-start flex-shrink-0 relative"
            style={{ height: '70vh' }}
          >
            <img
              src={img.src}
              alt={img.label}
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            {/* Overlay label */}
            <div
              className="absolute bottom-0 left-0 right-0 px-5 py-4"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
            >
              <p className="text-white font-bold text-lg leading-tight">{img.label}</p>
              <p className="text-white/70 text-sm">{img.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex justify-center gap-2 py-3">
        {PRODUCT_IMAGES.map((_, idx) => (
          <div
            key={idx}
            className="rounded-full transition-all duration-300"
            style={{
              width: activeIdx === idx ? '20px' : '6px',
              height: '6px',
              background: activeIdx === idx ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
            }}
          />
        ))}
      </div>

      {/* ── CTA Section ── */}
      <section className="px-5 py-6 space-y-4">
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.6)' }}
        >
          <h2 className="text-xl font-bold text-gray-900">Pourquoi choisir Bysis?</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Votre partenaire de confiance pour commander depuis Shein, AliExpress, Temu et Amazon — livré directement en Tunisie.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/arrivage')}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'rgba(0,0,0,0.80)' }}
            >
              Voir la boutique
            </button>
            <button
              onClick={openChat}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#1a1a1a', border: '1px solid rgba(0,0,0,0.15)' }}
            >
              Sisi AI ✦
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🛡️', title: 'Paiement sécurisé', desc: 'Transactions protégées' },
            { icon: '🚚', title: 'Livraison rapide', desc: 'Partout en Tunisie' },
            { icon: '⭐', title: 'Qualité garantie', desc: 'Produits vérifiés' },
            { icon: '📦', title: 'Suivi en temps réel', desc: 'Suivez votre commande' },
          ].map((b) => (
            <div
              key={b.title}
              className="rounded-xl p-3 space-y-1"
              style={{ background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}
            >
              <p className="text-lg">{b.icon}</p>
              <p className="text-xs font-bold text-gray-800">{b.title}</p>
              <p className="text-[10px] text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
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
