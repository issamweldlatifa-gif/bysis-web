import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';
import { useLocation } from 'wouter';
import { useChatContext } from '@/App';
import DynamicColorCarousel, { CarouselSlide } from '@/components/DynamicColorCarousel';
import { trpc } from '@/lib/trpc';

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
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
      </svg>
    ),
    label: 'Commander',
    path: '/order',
    color: '#FFF3E0',
    iconColor: '#F57C00',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: 'Suivre',
    path: '/track',
    color: '#E8F5E9',
    iconColor: '#388E3C',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
      </svg>
    ),
    label: 'Arrivages',
    path: '/arrivage',
    color: '#E3F2FD',
    iconColor: '#1976D2',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
      </svg>
    ),
    label: 'Calculer',
    path: '/calculator',
    color: '#F3E5F5',
    iconColor: '#7B1FA2',
  },
];

/* ── Arrivage Item Card ─────────────────────────────────────────────────────── */
function ArrivageCard({ item, onAdd }: { item: any; onAdd: () => void }) {
  return (
    <div
      className="flex-shrink-0 w-36 rounded-2xl overflow-hidden"
      style={{ background: '#FAFAFA', border: '1px solid #F0F0F0' }}
    >
      {/* Image */}
      <div className="w-full h-32 bg-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-semibold text-gray-900 truncate leading-tight">{item.name}</p>
        {item.priceTnd && (
          <p className="text-sm font-black text-gray-900 mt-0.5">{item.priceTnd} DT</p>
        )}
        <button
          onClick={onAdd}
          className="mt-2 w-full py-1.5 rounded-xl text-[11px] font-bold text-white"
          style={{ background: '#0A0A0A' }}
        >
          + Panier
        </button>
      </div>
    </div>
  );
}

/* ── Home Component ───────────────────────────────────────────────────────── */
function HomeContent() {
  const { setCarouselColor } = useBgColor();
  const [, navigate] = useLocation();
  const { openChat } = useChatContext();

  // Load arrivage items for the "Boutiques" section
  const { data: arrivageData } = trpc.arrivage.list.useQuery();
  const availableItems = arrivageData?.filter((i: any) => i.available)?.slice(0, 6) ?? [];

  return (
    <div className="w-full bg-white">
      {/* ── HERO CAROUSEL — color changes here only ─────────────────────── */}
      <DynamicColorCarousel
        slides={CAROUSEL_SLIDES}
        onColorChange={setCarouselColor}
      />

      {/* ── QUICK ACTIONS ───────────────────────────────────────────────── */}
      <section className="w-full px-4 py-4 bg-white">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl active:scale-95 transition-all duration-150"
              style={{ background: action.color }}
            >
              <span style={{ color: action.iconColor }}>{action.icon}</span>
              <span className="text-[11px] font-bold" style={{ color: action.iconColor }}>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── BYSIS AI BANNER ─────────────────────────────────────────────── */}
      <section className="mx-4 mb-4">
        <button
          onClick={openChat}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform duration-150"
          style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 100%)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="6"  cy="12" r="3" fill="#FF3131" />
              <circle cx="12" cy="12" r="3" fill="#F5C518" />
              <circle cx="18" cy="12" r="3" fill="#006A2E" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm text-white">Bysis AI</p>
            <p className="text-white/50 text-xs">Posez-moi une question...</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </section>

      {/* ── BOUTIQUES / ARRIVAGES ────────────────────────────────────────── */}
      {availableItems.length > 0 && (
        <section className="pb-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-base font-black text-gray-900">Boutiques</h2>
            <button
              onClick={() => navigate('/arrivage')}
              className="text-xs font-semibold text-blue-600"
            >
              Voir tout
            </button>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
            {availableItems.map((item: any) => (
              <ArrivageCard
                key={item.id}
                item={item}
                onAdd={() => navigate('/arrivage')}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── WHY BYSIS ───────────────────────────────────────────────────── */}
      <section className="px-4 pb-6 bg-white">
        <h2 className="text-base font-black text-gray-900 mb-3">Pourquoi choisir Bysis ?</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🚀', title: 'Livraison Rapide', desc: 'Recevez vos commandes en 20-25 jours' },
            { icon: '🤖', title: 'Bysis AI', desc: 'Assistant intelligent pour vous aider' },
            { icon: '🔒', title: 'Paiement Sécurisé', desc: 'Virement UIB ou mandat La Poste' },
            { icon: '📦', title: 'Suivi en Direct', desc: 'Suivez votre colis à chaque étape' },
          ].map((f) => (
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
