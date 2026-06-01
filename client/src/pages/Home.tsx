import { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';
import { useLocation } from 'wouter';
import { useChatContext } from '@/App';
import DynamicColorCarousel, { CarouselSlide } from '@/components/DynamicColorCarousel';

/* ── Carousel Slides — 4 sections with their dominant colors ─────────────── */
const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    image: '/manus-storage/section-red_be523b8d.png',
    color: '#ff3131',
    title: 'Nouvelle Collection',
    subtitle: 'Découvrez les dernières tendances',
  },
  {
    image: '/manus-storage/section-blue_063dba4e.png',
    color: '#003087',
    title: 'Ventes Flash',
    subtitle: 'Offres limitées — jusqu\'à -70%',
  },
  {
    image: '/manus-storage/section-green_a71d002e.png',
    color: '#c1ff72',
    title: 'Arrivages Frais',
    subtitle: 'Produits tout juste arrivés',
  },
  {
    image: '/manus-storage/section-teal_a23365db.png',
    color: '#0097b2',
    title: 'Nos Best-Sellers',
    subtitle: 'Les favoris de nos clients',
  },
];

/* ── Feature Cards ─────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '🚀', title: 'Livraison Rapide', desc: 'Recevez vos commandes en un temps record' },
  { icon: '🤖', title: 'Bysis AI', desc: 'Assistant intelligent pour vous aider' },
  { icon: '🔒', title: 'Paiement Sécurisé', desc: 'Transactions 100% sécurisées' },
  { icon: '📦', title: 'Suivi en Temps Réel', desc: 'Suivez votre colis à chaque étape' },
];

/* ── Quick Actions ─────────────────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { icon: '🛒', label: 'Commander', path: '/order' },
  { icon: '📍', label: 'Suivre', path: '/track' },
  { icon: '📦', label: 'Arrivages', path: '/arrivage' },
  { icon: '🧮', label: 'Calculer', path: '/calculator' },
];

/* ── Home Component ───────────────────────────────────────────────────────── */
function HomeContent() {
  const { setBgColor } = useBgColor();
  const [, navigate] = useLocation();
  const { openChat } = useChatContext();

  // Set initial background to first slide's color (lightened)
  useEffect(() => {
    setBgColor('#ffa8a8'); // lightened version of #ff3131
  }, [setBgColor]);

  return (
    <div className="w-full">
      {/* ── DYNAMIC COLOR CAROUSEL ─────────────────────────────────────────── */}
      <DynamicColorCarousel
        slides={CAROUSEL_SLIDES}
        slideHeight="340px"
        sectionTitle=""
      />

      {/* ── QUICK ACTIONS ──────────────────────────────────────────────────── */}
      <section className="w-full px-4 py-4 mx-2">
        <div
          className="rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)' }}
        >
          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-white/60 active:scale-95 transition-all"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-medium text-gray-800">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── BYSIS AI BANNER ────────────────────────────────────────────────── */}
      <section className="mx-4 my-2 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)' }}>
        <button
          onClick={openChat}
          className="w-full p-4 flex items-center gap-3 text-left"
        >
          <img
            src="/manus-storage/BlackandWhiteMinimalistSimpleModernTechnologyAILogo_7e8b089f.png"
            alt="Bysis AI"
            className="w-10 h-10 object-contain"
          />
          <div className="flex-1">
            <div className="text-white font-bold text-sm">Bysis AI</div>
            <div className="text-gray-400 text-xs">Posez-moi une question...</div>
          </div>
          <span className="text-white text-xl">›</span>
        </button>
      </section>

      {/* ── WHY BYSIS ──────────────────────────────────────────────────────── */}
      <section className="w-full px-4 py-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Pourquoi choisir Bysis ?</h2>
        <div
          className="rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)' }}
        >
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-3 rounded-xl bg-white/60">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-sm font-semibold text-gray-800">{f.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM SPACER */}
      <div className="h-4" />
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
