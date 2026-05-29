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

/* ── Google Lens SVG Icon (exact match) ─────────────────────────────────── */
function GoogleLensIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Camera body */}
      <rect x="2" y="6" width="20" height="14" rx="3" ry="3" stroke="#1A1A1A" strokeWidth="1.8" fill="none"/>
      {/* Lens circle */}
      <circle cx="12" cy="13" r="4" stroke="#1A1A1A" strokeWidth="1.8" fill="none"/>
      {/* Sparkle star top-right */}
      <path d="M18 4 L18.5 5.5 L20 6 L18.5 6.5 L18 8 L17.5 6.5 L16 6 L17.5 5.5 Z" fill="#1A1A1A"/>
    </svg>
  );
}

/* ── Header ─────────────────────────────────────────────────────────────── */
function AppHeader({ onScanClick }: { onScanClick: () => void }) {
  const { bgColor } = useBgColor();

  return (
    <header
      className="sticky top-0 z-40 w-full px-4 py-3 transition-all duration-500"
      style={{
        background: `${bgColor}CC`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Search bar - exact Amazon style */}
      <div
        className="flex items-center gap-3 px-4 h-11 rounded-full bg-white"
        style={{
          border: '1.5px solid #CCCCCC',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Search icon left */}
        <Search
          size={20}
          strokeWidth={2.2}
          style={{ color: '#1A1A1A', flexShrink: 0 }}
        />

        {/* Placeholder text */}
        <span
          className="flex-1 text-sm select-none"
          style={{ color: '#999999', fontWeight: 400 }}
        >
          Rechercher ou poser une question
        </span>

        {/* Google Lens icon right */}
        <button
          onClick={onScanClick}
          className="flex-shrink-0 flex items-center justify-center"
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <GoogleLensIcon size={22} />
        </button>
      </div>
    </header>
  );
}

/* ── Bottom Nav ─────────────────────────────────────────────────────────── */
function BottomNav({
  onProfileClick,
}: {
  onProfileClick: () => void;
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

/* ── Inner Layout ───────────────────────────────────────────────────────── */
function AppLayoutInner({ children, showNav = true }: AppLayoutProps) {
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
        style={{ background: pageBg, pointerEvents: 'none' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <AuthGateModal open={authOpen} onClose={() => setAuthOpen(false)} action="order" />
        <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />

        <AppHeader onScanClick={handleScanClick} />

        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
        >
          {children}
        </main>

        {showNav && (
          <BottomNav onProfileClick={() => setProfileOpen(true)} />
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
