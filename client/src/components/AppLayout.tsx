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

/* ── Google Lens Icon (exact match: square camera body + 4-point star top-right) */
function GoogleLensIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Square camera body with rounded corners - open top-right */}
      <path
        d="M17 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7"
        stroke="#1A1A1A"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner circle (lens) */}
      <circle cx="12" cy="13" r="3.5" stroke="#1A1A1A" strokeWidth="2" fill="none" />
      {/* 4-point sparkle star top-right corner */}
      <path
        d="M20 2 L20.6 4.4 L23 5 L20.6 5.6 L20 8 L19.4 5.6 L17 5 L19.4 4.4 Z"
        fill="#1A1A1A"
      />
    </svg>
  );
}

/* ── Header: Logo + Search bar ────────────────────────────────────────────── */
function AppHeader({ onScanClick }: { onScanClick: () => void }) {
  const { bgColor } = useBgColor();

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{ background: 'var(--app-bg-color, #cadfe2)' }}
    >
      {/* Safe-area spacer — fills iOS status bar with the same bg color */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)', background: 'var(--app-bg-color, #cadfe2)' }} />
      
      {/* Logo bar with AI logo + brand colors */}
      <div className="w-full px-3 py-2 flex items-center gap-2 border-b border-gray-200">
        {/* AI Logo */}
        <div className="flex-shrink-0">
          <img
            src="/manus-storage/BlackandWhiteMinimalistSimpleModernTechnologyAILogo_18aa669b.png"
            alt="Bysis AI"
            className="w-8 h-8 object-contain"
          />
        </div>
        
        {/* Brand name with colors - Red, Blue, White */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <span className="text-sm font-bold" style={{ color: '#FF0000' }}>B</span>
          <span className="text-sm font-bold" style={{ color: '#0047AB' }}>y</span>
          <span className="text-sm font-bold" style={{ color: '#FFFFFF', textShadow: '0 0 1px #000' }}>s</span>
          <span className="text-sm font-bold" style={{ color: '#FF0000' }}>i</span>
          <span className="text-sm font-bold" style={{ color: '#0047AB' }}>s</span>
        </div>
      </div>
      
      {/* Search bar */}
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

  const pageBg = isDark ? '#0D0D0F' : 'var(--app-bg-color, #cadfe2)';

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

        <AppHeader onScanClick={() => navigate('/scanner')} />

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
