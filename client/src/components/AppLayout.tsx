import { useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, Grid3x3, ShoppingCart, User, Plus, Search } from 'lucide-react';
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
function AppHeader({ onProfileClick }: { onProfileClick: () => void }) {
  const { bgColor } = useBgColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isDarkBg = isDark || isColorDark(bgColor);
  const headerBg = isDark
    ? 'rgba(13,13,15,0.95)'
    : `${bgColor}F0`;
  const textColor = isDarkBg ? '#FFFFFF' : '#1A1A1A';
  const searchBg  = isDarkBg ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.07)';
  const searchText = isDarkBg ? 'rgba(255,255,255,0.55)' : '#999';

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 h-12 transition-colors duration-500"
      style={{
        background: headerBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
      }}
    >
      {/* Logo */}
      <img
        src="/manus-storage/IMG_7012_25df5175.PNG"
        alt="Bysis"
        className="h-9 flex-shrink-0"
        style={{ objectFit: 'contain' }}
      />

      {/* Search bar */}
      <div
        className="flex-1 mx-3 flex items-center gap-2 px-3 h-8 rounded-full transition-colors duration-500"
        style={{ background: searchBg }}
      >
        <Search size={15} strokeWidth={1.8} style={{ color: searchText }} />
        <span className="text-xs transition-colors duration-500" style={{ color: searchText }}>
          Rechercher...
        </span>
      </div>

      {/* Profile */}
      <button
        onClick={onProfileClick}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ color: textColor }}
      >
        <User size={22} strokeWidth={1.6} />
      </button>
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
    { id: 'scan',      label: t('nav_scan'),       Icon: null,         href: null },
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

          /* ── Scan FAB ── */
          if (tab.id === 'scan') {
            return (
              <div key="scan" className="flex flex-col items-center" style={{ marginTop: '-20px' }}>
                <motion.button
                  onClick={onScanClick}
                  whileTap={{ scale: 0.88 }}
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: '#0047AB', boxShadow: '0 4px 14px rgba(0,71,171,0.40)' }}
                >
                  <Plus size={26} strokeWidth={1.8} color="white" />
                </motion.button>
                <span className="text-[10px] mt-1 font-medium" style={{ color: inactive }}>
                  {tab.label}
                </span>
              </div>
            );
          }

          /* ── Moi ── */
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
      className="min-h-screen flex flex-col transition-colors duration-500"
      style={{ background: pageBg, fontFamily: '"Inter", -apple-system, sans-serif' }}
    >
      <AuthGateModal open={authOpen} onClose={() => setAuthOpen(false)} action="order" />
      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />

      <AppHeader onProfileClick={() => setProfileOpen(true)} />

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
