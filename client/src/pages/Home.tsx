import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';
import { useLocation } from 'wouter';
import { useChatContext } from '@/App';
import DynamicColorCarousel, { CarouselSlide } from '@/components/DynamicColorCarousel';
import { trpc } from '@/lib/trpc';

/* ── Carousel Slides ─────────────────────────────────────────────────────── */
const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    color: '#f5c518',
    title: 'Organisez-vous',
    subtitle: 'Découvrez les meilleures ventes',
    cards: [{ label: 'Commander' }, { label: 'Arrivages' }, { label: 'Suivre' }, { label: 'Calculer' }],
  },
  {
    color: '#006a2e',
    title: 'Nos meilleures\nventes à\npetits prix',
    cards: [{ label: 'Mode' }, { label: 'Électronique' }, { label: 'Maison' }, { label: 'Beauté' }],
  },
  {
    color: '#1a3a5c',
    title: 'Meilleures\nventes de livres',
    subtitle: 'Découvrez maintenant',
    cards: [{ label: 'Romans' }, { label: 'Sciences' }, { label: 'Enfants' }, { label: 'Cuisine' }],
  },
  {
    color: '#ff3131',
    title: 'Ventes Flash',
    subtitle: "Offres limitées — jusqu'à -70%",
    cards: [{ label: 'Chaussures' }, { label: 'Sacs' }, { label: 'Vêtements' }, { label: 'Accessoires' }],
  },
];

/* ── Icon constants ──────────────────────────────────────────────────────── */
const SW = '1.8';

/* ── Quick Action Icons (outline) ────────────────────────────────────────── */
function IcoOrder({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}

function IcoTrack({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IcoBox({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function IcoCalc({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="8" y2="10"/>
      <line x1="12" y1="10" x2="12" y2="10"/>
      <line x1="16" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="8" y2="14"/>
      <line x1="12" y1="14" x2="12" y2="14"/>
      <line x1="16" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="18" x2="12" y2="18"/>
      <line x1="16" y1="18" x2="16" y2="18"/>
    </svg>
  );
}

/* ── Feature Icons (outline) ─────────────────────────────────────────────── */
function IcoRocket({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  );
}

function IcoAIFeature({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  );
}

function IcoShield({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}

function IcoPackage({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

/* ── Quick Actions data ──────────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { id: 'order',      label: 'Commander', path: '/order',      bg: '#FFF3E0', color: '#E65100' },
  { id: 'track',      label: 'Suivre',    path: '/track',      bg: '#E8F5E9', color: '#2E7D32' },
  { id: 'arrivage',   label: 'Arrivages', path: '/arrivage',   bg: '#E3F2FD', color: '#1565C0' },
  { id: 'calculator', label: 'Calculer',  path: '/calculator', bg: '#F3E5F5', color: '#6A1B9A' },
];

/* ── Features data ───────────────────────────────────────────────────────── */
const FEATURES = [
  { id: 'delivery', title: 'Livraison Rapide',   desc: 'Recevez vos commandes en 20–25 jours', color: '#E65100' },
  { id: 'ai',       title: 'Bysis AI',            desc: 'Assistant intelligent pour vous aider', color: '#1565C0' },
  { id: 'secure',   title: 'Paiement Sécurisé',   desc: 'Virement UIB ou mandat La Poste',       color: '#2E7D32' },
  { id: 'track',    title: 'Suivi en Direct',      desc: 'Suivez votre colis à chaque étape',    color: '#6A1B9A' },
];

function FeatureIcon({ id, color }: { id: string; color: string }) {
  if (id === 'delivery') return <IcoRocket color={color} />;
  if (id === 'ai')       return <IcoAIFeature color={color} />;
  if (id === 'secure')   return <IcoShield color={color} />;
  return <IcoPackage color={color} />;
}

function QuickActionIcon({ id, color }: { id: string; color: string }) {
  if (id === 'order')      return <IcoOrder color={color} />;
  if (id === 'track')      return <IcoTrack color={color} />;
  if (id === 'arrivage')   return <IcoBox color={color} />;
  if (id === 'calculator') return <IcoCalc color={color} />;
  return null;
}

/* ── Arrivage Card ───────────────────────────────────────────────────────── */
function ArrivageCard({ item, onAdd }: { item: any; onAdd: () => void }) {
  return (
    <div className="flex-shrink-0 w-36 rounded-2xl overflow-hidden" style={{ background: '#FAFAFA', border: '1px solid #F0F0F0' }}>
      <div className="w-full h-32 bg-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-gray-900 truncate leading-tight">{item.name}</p>
        {item.priceTnd && (
          <p className="text-sm font-black text-gray-900 mt-0.5">{item.priceTnd} DT</p>
        )}
        <button
          onClick={onAdd}
          className="mt-2 w-full py-1.5 rounded-xl text-[11px] font-bold text-white"
          style={{ background: '#111111' }}
        >
          + Panier
        </button>
      </div>
    </div>
  );
}

/* ── Home Component ──────────────────────────────────────────────────────── */
function HomeContent() {
  const { setCarouselColor } = useBgColor();
  const [, navigate] = useLocation();
  const { openChat } = useChatContext();

  const { data: arrivageData } = trpc.arrivage.list.useQuery();
  const availableItems = arrivageData?.filter((i: any) => i.available)?.slice(0, 6) ?? [];

  return (
    <div className="w-full bg-white">
      {/* Hero Carousel */}
      <DynamicColorCarousel slides={CAROUSEL_SLIDES} onColorChange={setCarouselColor} />

      {/* Quick Actions */}
      <section className="w-full px-4 py-4 bg-white">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2 py-3 px-1 rounded-2xl active:scale-95 transition-all duration-150"
              style={{ background: a.bg }}
            >
              <QuickActionIcon id={a.id} color={a.color} />
              <span className="text-[11px] font-bold leading-none" style={{ color: a.color }}>{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Bysis AI Banner */}
      <section className="mx-4 mb-4">
        <button
          onClick={openChat}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform duration-150"
          style={{ background: 'linear-gradient(135deg, #111111 0%, #1A1A2E 100%)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="6"  cy="12" r="3" fill="#FF3131"/>
              <circle cx="12" cy="12" r="3" fill="#F5C518"/>
              <circle cx="18" cy="12" r="3" fill="#006A2E"/>
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm text-white">Bysis AI</p>
            <p className="text-white/50 text-xs">Posez-moi une question...</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </section>

      {/* Boutiques / Arrivages */}
      {availableItems.length > 0 && (
        <section className="pb-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-base font-black text-gray-900">Boutiques</h2>
            <button onClick={() => navigate('/arrivage')} className="text-xs font-semibold text-blue-600">
              Voir tout
            </button>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {availableItems.map((item: any) => (
              <ArrivageCard key={item.id} item={item} onAdd={() => navigate('/arrivage')} />
            ))}
          </div>
        </section>
      )}

      {/* Why Bysis */}
      <section className="px-4 pb-6 bg-white">
        <h2 className="text-base font-black text-gray-900 mb-3">Pourquoi choisir Bysis ?</h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div key={f.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: f.color + '18' }}>
                <FeatureIcon id={f.id} color={f.color} />
              </div>
              <p className="font-bold text-sm text-gray-900">{f.title}</p>
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
