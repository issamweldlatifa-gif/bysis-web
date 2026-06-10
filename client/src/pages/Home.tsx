/**
 * Home — Minimal layout with Search + Quick Actions only
 */
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

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

/* ── Quick Actions data ──────────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { id: 'order',      label: 'Commander', labelAr: 'اطلب',    path: '/order',      bg: '#FFFFFF', color: '#0A0A0A' },
  { id: 'track',      label: 'Suivre',    labelAr: 'تتبع',    path: '/track',      bg: '#FFFFFF', color: '#0A0A0A' },
  { id: 'arrivage',   label: 'Arrivages', labelAr: 'جديد',    path: '/arrivage',   bg: '#FFFFFF', color: '#0A0A0A' },
  { id: 'calculator', label: 'Calculer',  labelAr: 'احسب',    path: '/calculator', bg: '#FFFFFF', color: '#0A0A0A' },
];

function QuickActionIcon({ id, color }: { id: string; color: string }) {
  if (id === 'order')      return <IcoOrder color={color} />;
  if (id === 'track')      return <IcoTrack color={color} />;
  if (id === 'arrivage')   return <IcoBox color={color} />;
  if (id === 'calculator') return <IcoCalc color={color} />;
  return null;
}

/* ── Home Component ──────────────────────────────────────────────────────── */
function HomeContent() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full bg-white">
      {/* Search Bar */}
      <section className="w-full px-4 py-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-gray-100">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher ou poser une question"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          />
        </div>
      </section>

      {/* Quick Actions — 4 buttons */}
      <section className="w-full px-4 py-6 bg-white">
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

      {/* Empty space for content */}
      <div className="h-32" />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
