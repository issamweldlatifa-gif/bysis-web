import { useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, Grid3x3, ShoppingCart, User, Search } from 'lucide-react';
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

/* ── Google Lens Icon (exact: camera body + sparkle star top-right) ──────── */
function GoogleLensIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Camera body */}
      <path
        d="M2 9C2 7.34315 3.34315 6 5 6H7.5L9 4H15L16.5 6H19C20.6569 6 22 7.34315 22 9V18C22 19.6569 20.6569 21 19 21H5C3.34315 21 2 19.6569 2 18V9Z"
        stroke="#1A1A1A"
        strokeWidth="1.8"
        fill="none"
      />
      {/* Lens circle */}
      <circle cx="12" cy="13" r="3.5" stroke="#1A1A1A" strokeWidth="1.8" fill="none" />
      {/* Sparkle ✦ top-right */}
      <path
        d="M19.5 3.5 L20 5 L21.5 5.5 L20 6 L19.5 7.5 L19 6 L17.5 5.5 L19 5 Z"
        fill="#1A1A1A"
      />
    </svg>
  );
}

/* ── Header: search bar only, full width ────────────────────────────────── */
function AppHeader({ onScanClick }: { onScanClick: () => void }) {
  const { bgColor } = useBgColor();

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{ background: 'var(--app-bg-color, #dcd7ce)' }}
    >
      {/* Safe-area spacer — fills iOS status bar with the same bg color */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)', background: 'var(--app-bg-color, #dcd7ce)' }} />
      <div className="w-full px-3 py-2.5">
        {/* Search bar — full width, white, rounded pill */}
        <div
          className="flex items-center gap-2 px-4 bg-white rounded-full"
          style={{
            height: '46px',
            border: '1.5px solid #D0D0D0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          {/* Search icon */}
          <Search size={20} strokeWidth={2.2} color="#1A1A1A" style={{ flexShrink: 0 }} />

          {/* Placeholder */}
          <span className="flex-1 text-sm" style={{ color: '#999', userSelect: 'none' }}>
            Rechercher ou poser une question
          </span>

          {/* Google Lens button */}
          <button
            onClick={onScanClick}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors active:scale-90"
            style={{ border: 'none', background: 'transparent' }}
            aria-label="Scanner avec Google Lens"
          >
            <GoogleLensIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ── Bottom Nav ─────────────────────────────────────────────────────────── */
function BottomNav({ onProfileClick }: { onProfileClick: () => void }) {
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
    { id: 'home',      label: t('nav_home'),     Icon: Home,         href: '/' },
    { id: 'boutiques', label: t('nav_boutiques'), Icon: Grid3x3,      href: '/arrivage' },
    { id: 'panier',    label: t('nav_panier'),    Icon: ShoppingCart, href: '/panier' },
    { id: 'moi',       label: t('nav_moi'),       Icon: User,         href: null },
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
                <Icon size={22} strokeWidth={isActive ? 2 : 1.6} />
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

/* ── Inner Layout ───────────────────────────────────────────────────────── */
function AppLayoutInner({ children, showNav = true }: AppLayoutProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen]       = useState(false);
  const { bgColor }                   = useBgColor();
  const [, navigate]                  = useLocation();
  const { theme }                     = useTheme();
  const isDark                        = theme === 'dark';

  const pageBg = isDark ? '#0D0D0F' : 'var(--app-bg-color, #dcd7ce)';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        fontFamily: '"Inter", -apple-system, sans-serif',
        /* Extend bg behind iOS status bar */
        background: pageBg,
      }}
    >
      {/* Full-screen background — same color as header, covers safe-area too */}
      <div
        className="fixed z-0 transition-colors duration-500"
        style={{
          background: pageBg,
          pointerEvents: 'none',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          /* Extend into safe-area on all sides */
          marginTop: 'calc(-1 * env(safe-area-inset-top, 0px))',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <AuthGateModal open={authOpen} onClose={() => setAuthOpen(false)} action="order" />
        <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />

        <AppHeader onScanClick={() => navigate('/calculator')} />

        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
        >
          {children}
        </main>

        {showNav && <BottomNav onProfileClick={() => setProfileOpen(true)} />}
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
