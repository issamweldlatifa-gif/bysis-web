import { useState, ReactNode, createContext, useContext } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Grid3x3, TrendingUp, ShoppingCart, User, Plus, Search } from 'lucide-react';
import AuthGateModal from '@/components/AuthGateModal';
import ProfileSheet from '@/components/ProfileSheet';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';

// Dynamic Background Color Context
const BgColorContext = createContext<{ bgColor: string; setBgColor: (color: string) => void }>({ bgColor: '#FFFFFF', setBgColor: () => {} });
export const useBgColor = () => useContext(BgColorContext);

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  onChatOpen?: () => void;
}

/* ── Shein Design Tokens ────────────────────────────────────────────────── */
const SHEIN_RED    = '#1A1A1A';
const SHEIN_BLACK  = '#1A1A1A';

/* ── Lucide React Icons — Shein-style line icons ────────────────────────── */

/* ── Bysis Logo ─────────────────────────────────────────────────────────── */
const IconBysis = () => (
  <img
    src="/manus-storage/IMG_7012_25df5175.PNG"
    alt="Bysis Logo"
    className="h-10 md:h-12 flex-shrink-0"
    style={{ objectFit: 'contain' }}
  />
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
      </div>

      {/* Search bar — Shein style */}
      <div
        className="flex-1 mx-3 flex items-center gap-2 px-3 h-8 rounded-full"
        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F5F5F5' }}
      >
        <Search size={18} strokeWidth={1.8} style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#999' }} />
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
        <User size={22} strokeWidth={1.6} />
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
    { id: 'home',      label: t('nav_home'),     Icon: Home,       href: '/' },
    { id: 'boutiques', label: t('nav_boutiques'), Icon: Grid3x3, href: '/arrivage' },
    { id: 'scan',      label: t('nav_scan'),      Icon: null,           href: null },
    { id: 'panier',    label: t('nav_panier'),    Icon: ShoppingCart,       href: '/panier' },
    { id: 'moi',       label: t('nav_moi'),       Icon: User,       href: null },
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
                    background: '#0047AB',
                    boxShadow: `0 4px 14px rgba(0,71,171,0.40)`,
                  }}
                >
                  <Plus size={26} strokeWidth={1.8} color="white" />
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
                <User size={22} strokeWidth={1.6} />
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
                {Icon && <Icon size={22} strokeWidth={isActive ? 2 : 1.6} />}
                {isPanier && totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 w-[16px] h-[16px] rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: '#0047AB', lineHeight: 1 }}
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
  const [bgColor, setBgColor]         = useState('#FFFFFF');
  const [, navigate]                  = useLocation();
  const { theme }                     = useTheme();
  const isDark                        = theme === 'dark';
  const pageBg                        = isDark ? '#0D0D0F' : bgColor;

  const handleScanClick = () => navigate('/calculator');

  return (
    <BgColorContext.Provider value={{ bgColor, setBgColor }}>
      <div
        className="min-h-screen flex flex-col transition-colors duration-500"
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
    </BgColorContext.Provider>
  );
}
