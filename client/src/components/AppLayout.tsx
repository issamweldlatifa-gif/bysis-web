import { useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, Grid3x3, ShoppingCart, User, Search, Camera } from 'lucide-react';
import AuthGateModal from '@/components/AuthGateModal';
import ProfileSheet from '@/components/ProfileSheet';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BgColorProvider, useBgColor } from '@/contexts/BgColorContext';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  onChatOpen?: () => void;
}

/* ── Helper: detect if a hex color is dark ─────────────────────────────── */
function isColorDark(hex: string): boolean {
  try {
    const h = hex.replace('#', '');
    if (h.length < 6) return false;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  } catch {
    return false;
  }
}

/* ── Header ─────────────────────────────────────────────────────────────── */
function AppHeader({ onProfileClick, onScanClick }: { onProfileClick: () => void; onScanClick: () => void }) {
  const { bgColor } = useBgColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isDarkBg = isDark || isColorDark(bgColor);
  
  // Header background: semi-transparent with blur
  const headerBg = isDark
    ? 'rgba(13,13,15,0.85)'
    : `rgba(192,192,192,0.85)`;

  const textColor = isDarkBg ? '#FFFFFF' : '#1A1A1A';
  const searchBg = '#FFFFFF';
  const searchPlaceholder = '#999999';
  const searchBorder = '#DDDDDD';

  return (
    <header
      className="sticky top-0 z-40 w-full px-4 py-3 transition-all duration-500"
      style={{
        background: headerBg,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Logo */}
        <img
          src="/manus-storage/IMG_7012_25df5175.PNG"
          alt="Bysis"
          className="h-8 flex-shrink-0"
          style={{ objectFit: 'contain' }}
        />

        {/* Search bar - Professional Amazon style */}
        <div
          className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300"
          style={{
            background: searchBg,
            border: `1.5px solid ${searchBorder}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <Search size={18} strokeWidth={2} style={{ color: searchPlaceholder, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Rechercher ou poser une question"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#1A1A1A' }}
            disabled
          />
          {/* Google Lens / Camera button */}
          <button
            onClick={onScanClick}
            className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            style={{ color: '#1A1A1A' }}
            title="Scanner avec Google Lens"
          >
            <Camera size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Profile */}
        <button
          onClick={onProfileClick}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
          style={{ color: textColor }}
        >
          <User size={20} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}

/* ── Bottom Nav ─────────────────────────────────────────────────────────── */
function BottomNav({
  onProfileClick,
  onScanClick,
}: {
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
  const active   = '#1A1A1A';
  const inactive = isDark ? 'rgba(255,255,255,0.38)' : '#AAAAAA';

  const tabs = [
    { id: 'home',      label: t('nav_home'),      Icon: Home,         href: '/' },
    { id: 'boutiques', label: t('nav_boutiques'),  Icon: Grid3x3,      href: '/arrivage' },
    { id: 'panier',    label: t('nav_panier'),     Icon: ShoppingCart, href: '/panier' },
    { id: 'moi',       label: t('nav_moi'),        Icon: User,         href: null },
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
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
      }}
    >
      <div className="flex items-center justify-around pt-2 px-1">
        {tabs.map((tab) => {
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
                    style={{ background: '#0047AB' }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{tab.label}</span>
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

/* ── Inner Layout (uses BgColorContext) ─────────────────────────────────── */
function AppLayoutInner({ children, showNav = true, onChatOpen }: AppLayoutProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen]       = useState(false);
  const { bgColor }                   = useBgColor();
  const [, navigate]                  = useLocation();
  const { theme }                     = useTheme();
  const isDark                        = theme === 'dark';

  const pageBg = isDark ? '#0D0D0F' : bgColor;

  const handleScanClick = () => navigate('/calculator');

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: '"Inter", -apple-system, sans-serif' }}
    >
      {/* Full-screen dynamic background */}
      <div
        className="fixed inset-0 z-0 transition-colors duration-500"
        style={{
          background: pageBg,
          pointerEvents: 'none',
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <AuthGateModal open={authOpen} onClose={() => setAuthOpen(false)} action="order" />
        <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />

        <AppHeader onProfileClick={() => setProfileOpen(true)} onScanClick={handleScanClick} />

        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
        >
          {children}
        </main>

        {showNav && (
          <BottomNav
            onProfileClick={() => setProfileOpen(true)}
            onScanClick={handleScanClick}
          />
        )}
      </div>
    </div>
  );
}

/* ── Public export ─────────────────────────────────────────────────────── */
export default function AppLayout(props: AppLayoutProps) {
  return (
    <BgColorProvider>
      <AppLayoutInner {...props} />
    </BgColorProvider>
  );
}
