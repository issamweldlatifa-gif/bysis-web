import { useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import AuthGateModal from '@/components/AuthGateModal';
import ProfileSheet from '@/components/ProfileSheet';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  onChatOpen?: () => void;
}

/* ── Shein Design Tokens ────────────────────────────────────────────────── */
const SHEIN_RED    = '#E8192C';
const SHEIN_BLACK  = '#1A1A1A';

/* ── Shein-style Line Icons ─────────────────────────────────────────────── */

/** Home — Shein style: simple house outline */
const IconHome = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

/** Categories — Shein style: grid icon */
const IconCategories = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

/** Trending — Shein style: lightning/trend icon */
const IconTrending = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

/** Cart — Shein style: shopping bag */
const IconCart = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

/** User — Shein style: person silhouette */
const IconUser = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

/** Scan — center FAB icon */
const IconScan = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
  </svg>
);

/* ── Bysis Logo ─────────────────────────────────────────────────────────── */
const IconBysis = () => (
  <div
    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-base flex-shrink-0"
    style={{ background: SHEIN_RED }}
  >
    B
  </div>
);

/* ── Search Icon ────────────────────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ── Header ─────────────────────────────────────────────────────────────── */
function AppHeader({ onProfileClick }: { onProfileClick: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bg     = isDark ? '#1C1C1E' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E5E5E5';
  const text   = isDark ? '#FFFFFF' : SHEIN_BLACK;

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 h-12"
      style={{
        background: bg,
        borderBottom: `1px solid ${border}`,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <IconBysis />
        <span
          className="text-lg font-black tracking-tight"
          style={{ color: SHEIN_RED, letterSpacing: '-0.03em' }}
        >
          bysis
        </span>
      </div>

      {/* Search bar — Shein style */}
      <div
        className="flex-1 mx-3 flex items-center gap-2 px-3 h-8 rounded-full"
        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F5F5F5' }}
      >
        <IconSearch />
        <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#999' }}>
          Rechercher...
        </span>
      </div>

      {/* Profile button */}
      <button
        onClick={onProfileClick}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }}
      >
        <IconUser />
      </button>
    </header>
  );
}

/* ── Bottom Nav ─────────────────────────────────────────────────────────── */
function BottomNav({ onProfileClick, onScanClick }: {
  onProfileClick: () => void;
  onScanClick: () => void;
}) {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();
  const { t } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg       = isDark ? '#1C1C1E' : '#FFFFFF';
  const border   = isDark ? 'rgba(255,255,255,0.08)' : '#E5E5E5';
  const active   = SHEIN_RED;
  const inactive = isDark ? 'rgba(255,255,255,0.38)' : '#AAAAAA';

  const tabs = [
    { id: 'home',      label: t('nav_home'),     Icon: IconHome,       href: '/' },
    { id: 'boutiques', label: t('nav_boutiques'), Icon: IconCategories, href: '/arrivage' },
    { id: 'scan',      label: t('nav_scan'),      Icon: null,           href: null },
    { id: 'panier',    label: t('nav_panier'),    Icon: IconCart,       href: '/panier' },
    { id: 'moi',       label: t('nav_moi'),       Icon: IconUser,       href: null },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: bg,
        borderTop: `1px solid ${border}`,
        /* Shein-style: lift above safe area with extra 12px */
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
      }}
    >
      <div className="flex items-center justify-around pt-2 pb-0 px-1">
        {tabs.map((tab) => {

          /* ── Scan FAB (center) ── */
          if (tab.id === 'scan') {
            return (
              <div key="scan" className="flex flex-col items-center" style={{ marginTop: '-20px' }}>
                <motion.button
                  onClick={onScanClick}
                  whileTap={{ scale: 0.88 }}
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: SHEIN_RED,
                    boxShadow: `0 4px 14px rgba(232,25,44,0.40)`,
                  }}
                >
                  <IconScan />
                </motion.button>
                <span className="text-[10px] mt-1 font-medium" style={{ color: inactive }}>
                  {tab.label}
                </span>
              </div>
            );
          }

          /* ── Moi button ── */
          if (tab.id === 'moi') {
            return (
              <motion.button
                key="moi"
                onClick={onProfileClick}
                whileTap={{ scale: 0.90 }}
                className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[52px]"
                style={{ color: inactive }}
              >
                <IconUser active={false} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </motion.button>
            );
          }

          /* ── Regular tab ── */
          const { Icon } = tab;
          const isActive = location === tab.href;
          const isPanier = tab.id === 'panier';

          return (
            <motion.button
              key={tab.id}
              onClick={() => tab.href && navigate(tab.href)}
              whileTap={{ scale: 0.90 }}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[52px] relative"
              style={{ color: isActive ? active : inactive }}
            >
              <span className="relative">
                {Icon && <Icon active={isActive} />}
                {isPanier && totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 w-[16px] h-[16px] rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: SHEIN_RED, lineHeight: 1 }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium relative z-10">{tab.label}</span>
              {/* Active indicator — thin red underline like Shein */}
              {isActive && (
                <motion.span
                  layoutId="navActiveBar"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full"
                  style={{ background: active }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}

/* ── Main Layout ─────────────────────────────────────────────────────────── */
export default function AppLayout({ children, showNav = true }: AppLayoutProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen]       = useState(false);
  const [, navigate]                  = useLocation();
  const { theme }                     = useTheme();
  const isDark                        = theme === 'dark';
  const pageBg                        = isDark ? '#0D0D0F' : '#FFFFFF';

  const handleScanClick = () => navigate('/calculator');

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: pageBg, fontFamily: '"Inter", -apple-system, sans-serif' }}
    >
      <AuthGateModal open={authOpen} onClose={() => setAuthOpen(false)} action="order" />
      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />

      <AppHeader onProfileClick={() => setProfileOpen(true)} />

      {/* Content — bottom padding accounts for nav height + safe area */}
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}>
        {children}
      </main>

      {showNav && (
        <BottomNav
          onProfileClick={() => setProfileOpen(true)}
          onScanClick={handleScanClick}
        />
      )}
    </div>
  );
}
