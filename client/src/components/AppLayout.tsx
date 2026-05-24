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

/* ── Design tokens ─────────────────────────────────────────────────────── */
const BLUE      = '#0070BA';
const NAVY      = '#003087';

/* ── Icons ─────────────────────────────────────────────────────────────── */
const IconHome = ({ fill }: { fill?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={fill ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconShop = ({ fill }: { fill?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={fill ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconScan = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
    <rect x="7" y="7" width="10" height="10" rx="1"/>
  </svg>
);
const IconCart = ({ fill }: { fill?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={fill ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
  </svg>
);
const IconUser = ({ fill }: { fill?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={fill ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconBysis = () => (
  <div
    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
    style={{ background: `linear-gradient(135deg, ${BLUE}, ${NAVY})` }}
  >
    B
  </div>
);

/* ── Header ─────────────────────────────────────────────────────────────── */
function AppHeader({ onProfileClick }: { onProfileClick: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bg = isDark ? '#1C1C1E' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const text = isDark ? '#FFFFFF' : '#1C1C1E';

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 h-14"
      style={{
        background: bg,
        borderBottom: `1px solid ${border}`,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <IconBysis />
        <span className="text-lg font-black tracking-tight" style={{ color: BLUE }}>bysis</span>
      </div>
      <button
        onClick={onProfileClick}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#EBF4FB', color: BLUE }}
      >
        <IconUser />
      </button>
    </header>
  );
}

/* ── Bottom Nav ─────────────────────────────────────────────────────────── */
function BottomNav({ onProfileClick, onScanClick }: { onProfileClick: () => void; onScanClick: () => void }) {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();
  const { t } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? '#1C1C1E' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const active = BLUE;
  const inactive = isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF';

  const tabs = [
    { id: 'home',      label: t('nav_home'),      icon: IconHome,  href: '/' },
    { id: 'boutiques', label: t('nav_boutiques'),  icon: IconShop,  href: '/arrivage' },
    { id: 'scan',      label: t('nav_scan'),       icon: null,      href: null },
    { id: 'panier',    label: t('nav_panier'),     icon: IconCart,  href: '/panier' },
    { id: 'moi',       label: t('nav_moi'),        icon: IconUser,  href: null },
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
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      <div className="flex items-end justify-around h-[62px] px-2">
        {tabs.map((tab) => {
          // Scan button — center FAB
          if (tab.id === 'scan') {
            return (
              <div key="scan" className="flex flex-col items-center justify-end pb-1" style={{ marginTop: '-18px' }}>
                <motion.button
                  onClick={onScanClick}
                  whileTap={{ scale: 0.88 }}
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${BLUE}, ${NAVY})`,
                    boxShadow: `0 4px 16px rgba(0,112,186,0.45)`,
                  }}
                >
                  <IconScan />
                </motion.button>
                <span className="text-[10px] font-semibold mt-1" style={{ color: inactive }}>{tab.label}</span>
              </div>
            );
          }

          // Moi button
          if (tab.id === 'moi') {
            const isActive = false;
            return (
              <motion.button
                key="moi"
                onClick={onProfileClick}
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl relative"
                style={{ color: isActive ? active : inactive }}
              >
                <IconUser fill={isActive} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </motion.button>
            );
          }

          // Regular tab
          const Icon = tab.icon!;
          const isActive = location === tab.href || (tab.href === '/arrivage' && location === '/arrivage');
          const isPanier = tab.id === 'panier';

          return (
            <motion.button
              key={tab.id}
              onClick={() => tab.href && navigate(tab.href)}
              whileTap={{ scale: 0.88 }}
              className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl relative"
              style={{ color: isActive ? active : inactive }}
            >
              {isActive && (
                <motion.span
                  layoutId="navActivePill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: isDark ? 'rgba(0,112,186,0.15)' : '#EBF4FB' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">
                <Icon fill={isActive} />
                {isPanier && totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: '#EF4444' }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold relative z-10">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}

/* ── Main Layout ─────────────────────────────────────────────────────────── */
export default function AppLayout({ children, showNav = true, onChatOpen }: AppLayoutProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [, navigate] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pageBg = isDark ? '#0D0D0F' : '#EEF2F7';

  const handleScanClick = () => {
    navigate('/calculator');
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: pageBg, fontFamily: 'Inter, -apple-system, sans-serif' }}
    >
      <AuthGateModal open={authOpen} onClose={() => setAuthOpen(false)} action="order" />
      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />

      <AppHeader onProfileClick={() => setProfileOpen(true)} />

      <main className="flex-1 overflow-y-auto pb-24">
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
