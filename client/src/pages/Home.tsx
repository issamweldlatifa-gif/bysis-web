import AppLayout from '@/components/AppLayout';
import { useBgColor } from '@/contexts/BgColorContext';
import { useLocation } from 'wouter';

import HeroSlider, { HeroSlide } from '@/components/HeroSlider';
import { trpc } from '@/lib/trpc';
import { useMemo } from 'react';



/* ── Icon constants — Nike thin style ───────────────────────────────────── */
const SW = '1.5';

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

/* ── Quick Actions data — Nike: blanc + border noir ─────────────────────── */
const QUICK_ACTIONS = [
  { id: 'order',      label: 'Commander', labelAr: 'اطلب',    path: '/order',      bg: '#FFFFFF', color: '#0A0A0A' },
  { id: 'track',      label: 'Suivre',    labelAr: 'تتبع',    path: '/track',      bg: '#FFFFFF', color: '#0A0A0A' },
  { id: 'arrivage',   label: 'Arrivages', labelAr: 'جديد',    path: '/arrivage',   bg: '#FFFFFF', color: '#0A0A0A' },
  { id: 'calculator', label: 'Calculer',  labelAr: 'احسب',    path: '/calculator', bg: '#FFFFFF', color: '#0A0A0A' },
];

/* ── Features data — Nike: noir/blanc ────────────────────────────────────── */
const FEATURES = [
  { id: 'delivery', title: 'Livraison Rapide',   desc: 'Recevez vos commandes en 20–25 jours', color: '#0A0A0A' },
  { id: 'ai',       title: 'Bysis AI',            desc: 'Assistant intelligent pour vous aider', color: '#0A0A0A' },
  { id: 'secure',   title: 'Paiement Sécurisé',   desc: 'Virement UIB ou mandat La Poste',       color: '#0A0A0A' },
  { id: 'track',    title: 'Suivi en Direct',      desc: 'Suivez votre colis à chaque étape',    color: '#0A0A0A' },
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
          className="mt-2 w-full text-[11px] font-bold text-white"
          style={{ background: '#0A0A0A', borderRadius: 36, padding: '8px 12px' }}
        >
          + Panier
        </button>
      </div>
    </div>
  );
}

/* ── Home Component ──────────────────────────────────────────────────────── */
function HomeContent() {

  const [, navigate] = useLocation();
  const { data: heroSlides = [] } = trpc.sliders.getActive.useQuery();



  const heroSliderData = useMemo((): HeroSlide[] => {
    return (heroSlides || []).map(s => ({
      id: s.id,
      title: s.title,
      description: s.description || undefined,
      videoUrl: s.videoUrl || undefined,
      backgroundColor: s.backgroundColor || '#FFC107',
      backgroundGradient: s.backgroundGradient || undefined,
      countdownEndTime: s.countdownEndTime ? new Date(s.countdownEndTime) : undefined,
    }));
  }, [heroSlides]);

  return (
    <div className="w-full bg-white">
      {/* Hero Slider with Video & Countdown */}
      {heroSliderData && heroSliderData.length > 0 && (
        <div className="px-4 py-4">
          <HeroSlider slides={heroSliderData} />
        </div>
      )}



      {/* Quick Actions — Nike style: blanc + border noir + icônes thin */}
      <section className="w-full px-4 py-4 bg-white">
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2 py-3.5 px-1 rounded-2xl transition-all duration-150"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E8E8',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <QuickActionIcon id={a.id} color="#0A0A0A" />
              <span
                className="leading-none text-center"
                style={{ fontSize: 11, fontWeight: 700, color: '#0A0A0A', fontFamily: 'Poppins, sans-serif' }}
              >{a.label}</span>
              <span
                className="leading-none text-center"
                style={{ fontSize: 9, fontWeight: 300, color: '#AAAAAA', fontFamily: 'Poppins, sans-serif' }}
              >{a.labelAr}</span>
            </button>
          ))}
        </div>
      </section>



      {/* Why Bysis — Nike style: minimaliste noir/blanc */}
      <section className="px-4 pb-6 bg-white">
        <h2
          className="mb-4"
          style={{ fontSize: 22, fontWeight: 900, color: '#0A0A0A', fontFamily: '"Barlow Condensed", Poppins, sans-serif', letterSpacing: '-0.01em', textTransform: 'uppercase', lineHeight: 1 }}
        >Pourquoi Bysis ?</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-2xl"
              style={{ background: '#FAFAFA', border: '1px solid #F0F0F0' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: '#0A0A0A' }}
              >
                <FeatureIcon id={f.id} color="#FFFFFF" />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.01em' }}>{f.title}</p>
              <p style={{ fontSize: 11, fontWeight: 300, color: '#888888', marginTop: 2, lineHeight: 1.5, fontFamily: 'Poppins, sans-serif' }}>{f.desc}</p>
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
