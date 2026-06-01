import { useCallback, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';
import { useImageColor } from '@/hooks/useImageColor';
import { useLocation } from 'wouter';
import { useChatContext } from '@/App';

const HERO_IMG = '/manus-storage/BluePlayfulTypographicComingSoonFashionPoster-1_a27baff4.png';
const HERO_BG_COLOR = '#cadfe2';

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

  useEffect(() => {
    setBgColor(HERO_BG_COLOR);
  }, [setBgColor]);

  const handleColor = useCallback((hex: string) => {
    setBgColor(hex);
  }, [setBgColor]);

  useImageColor(HERO_IMG, handleColor);

  return (
    <div className="w-full bg-white">
      {/* HERO IMAGE — optimized */}
      <div className="w-full relative" style={{ aspectRatio: '3/4', maxHeight: '50vh', overflow: 'hidden', background: HERO_BG_COLOR }}>
        <img
          src={HERO_IMG}
          alt="Bysis - Nouvelle Collection"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          loading="eager"
          decoding="async"
          crossOrigin="anonymous"
        />
      </div>

      {/* QUICK ACTIONS */}
      <section className="w-full px-4 py-4 bg-white">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* BYSIS AI BANNER */}
      <section className="mx-4 my-3 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)' }}>
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

      {/* WHY BYSIS */}
      <section className="w-full px-4 py-4 bg-white">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Pourquoi choisir Bysis ?</h2>
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
