import { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';
import { useLocation } from 'wouter';
import { useChatContext } from '@/App';
import DynamicColorCarousel, { CarouselSlide } from '@/components/DynamicColorCarousel';

/* ── Carousel Slides ─────────────────────────────────────────────────────── */
const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    color: '#f5c518',        // Amazon yellow
    title: 'Organisez-vous',
    subtitle: 'Découvrez les meilleures ventes',
    cards: [
      { label: 'Commander' },
      { label: 'Arrivages' },
      { label: 'Suivre' },
      { label: 'Calculer' },
    ],
  },
  {
    color: '#006a2e',        // Amazon green
    title: 'Nos meilleures\nventes à\npetits prix',
    cards: [
      { label: 'Mode' },
      { label: 'Électronique' },
      { label: 'Maison' },
      { label: 'Beauté' },
    ],
  },
  {
    color: '#1a3a5c',        // Amazon dark blue
    title: 'Meilleures\nventes de livres',
    subtitle: 'Découvrez maintenant',
    cards: [
      { label: 'Romans' },
      { label: 'Sciences' },
      { label: 'Enfants' },
      { label: 'Cuisine' },
    ],
  },
  {
    color: '#ff3131',        // Bysis red
    title: 'Ventes Flash',
    subtitle: "Offres limitées — jusqu'à -70%",
    cards: [
      { label: 'Chaussures' },
      { label: 'Sacs' },
      { label: 'Vêtements' },
      { label: 'Accessoires' },
    ],
  },
];

/* ── Quick Actions ─────────────────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { icon: '🛒', label: 'Commander', path: '/order' },
  { icon: '📍', label: 'Suivre', path: '/track' },
  { icon: '📦', label: 'Arrivages', path: '/arrivage' },
  { icon: '🧮', label: 'Calculer', path: '/calculator' },
];

/* ── Features ─────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '🚀', title: 'Livraison Rapide', desc: 'Recevez vos commandes en un temps record' },
  { icon: '🤖', title: 'Bysis AI', desc: 'Assistant intelligent pour vous aider' },
  { icon: '🔒', title: 'Paiement Sécurisé', desc: 'Transactions 100% sécurisées' },
  { icon: '📦', title: 'Suivi en Temps Réel', desc: 'Suivez votre colis à chaque étape' },
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
      <DynamicColorCarousel slides={CAROUSEL_SLIDES} />

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

      {/* ── BYSIS AI BANNER ─────────────────────────────────────────────── */}
      <section className="mx-4 mb-4">
        <button
          onClick={openChat}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gray-900 text-white active:scale-[0.98] transition-transform duration-150"
        >
          <img
            src="/manus-storage/BlackandWhiteMinimalistSimpleModernTechnologyAILogo_7e8b089f.png"
            alt="Bysis AI"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">Bysis AI</p>
            <p className="text-white/60 text-xs">Posez-moi une question...</p>
          </div>
          <span className="text-white/40 text-lg">›</span>
        </button>
      </section>

      {/* ── WHY BYSIS ───────────────────────────────────────────────────── */}
      <section className="px-4 pb-6 bg-white">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Pourquoi choisir Bysis ?</h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-2xl">{f.icon}</span>
              <p className="mt-2 font-bold text-sm text-gray-900">{f.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
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
