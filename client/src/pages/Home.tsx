import { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';
import { useLocation } from 'wouter';
import { useChatContext } from '@/App';
import DynamicColorCarousel, { CarouselSlide } from '@/components/DynamicColorCarousel';

/* ── Carousel Slides ─────────────────────────────────────────────────────── */
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
    subtitle: "Offres limitées — jusqu'à -70%",
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

  // Reset page background to white — hero handles its own color
  useEffect(() => {
    setBgColor('#ffffff');
  }, [setBgColor]);

  return (
    <div className="w-full bg-white">
      {/* ── HERO CAROUSEL — color changes here only ─────────────────────── */}
      <DynamicColorCarousel slides={CAROUSEL_SLIDES} height="56vw" />

      {/* ── QUICK ACTIONS — white background ───────────────────────────── */}
      <section className="w-full px-4 py-4 bg-white">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all duration-150"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-semibold text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ─────────────────────────────────────────────────────── */}
      <div className="h-2 bg-gray-100" />

      {/* ── BYSIS AI BANNER ─────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-3">
        <button
          onClick={openChat}
          className="w-full rounded-2xl overflow-hidden flex items-center gap-3 p-4 text-left active:scale-[0.98] transition-transform duration-150"
          style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2d2d2d 100%)' }}
        >
          <img
            src="/manus-storage/BlackandWhiteMinimalistSimpleModernTechnologyAILogo_7e8b089f.png"
            alt="Bysis AI"
            className="w-10 h-10 object-contain flex-none"
          />
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm">Bysis AI</div>
            <div className="text-gray-400 text-xs mt-0.5">Posez-moi une question...</div>
          </div>
          <span className="text-white/60 text-xl flex-none">›</span>
        </button>
      </section>

      {/* ── DIVIDER ─────────────────────────────────────────────────────── */}
      <div className="h-2 bg-gray-100" />

      {/* ── WHY BYSIS ───────────────────────────────────────────────────── */}
      <section className="w-full px-4 py-4 bg-white">
        <h2 className="text-base font-bold text-gray-900 mb-3">Pourquoi choisir Bysis ?</h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-sm font-semibold text-gray-800">{f.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

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
