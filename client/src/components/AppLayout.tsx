import { useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, ShoppingCart, User, Search, Menu } from 'lucide-react';
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

/* ── Top Header: Search Bar ────────────────────────────────────────────────────── */
function TopHeader() {
  const [, navigate] = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      {/* Safe-area spacer */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)', background: '#FFFFFF' }} />
      
      {/* Search bar */}
      <div className="w-full px-4 py-3 flex items-center gap-3">
        <Search size={20} color="#999" />
        <input
          type="text"
          placeholder="Rechercher ou poser une question"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          onClick={() => navigate('/scanner')}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
          aria-label="Scanner"
        >
          <GoogleLensIcon />
        </button>
      </div>
    </header>
  );
}

/* ── Bottom Nav: Header Icons + Logo ─────────────────────────────────────────────── */
function BottomNav({ onProfileClick }: { onProfileClick: () => void }) {
  const [, navigate] = useLocation();
  const { totalItems } = useCart();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="w-full"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E5E5E5',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Home icon */}
        <motion.button
          whileTap={{ scale: 0.90 }}
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
          aria-label="Accueil"
        >
          <Home size={24} strokeWidth={1.5} color="#1A1A1A" />
        </motion.button>

        {/* Center-left: User icon */}
        <motion.button
          whileTap={{ scale: 0.90 }}
          onClick={onProfileClick}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
          aria-label="Profil"
        >
          <User size={24} strokeWidth={1.5} color="#1A1A1A" />
        </motion.button>

        {/* Center: Cart with badge */}
        <motion.button
          whileTap={{ scale: 0.90 }}
          onClick={() => navigate('/panier')}
          className="relative flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
          aria-label="Panier"
        >
          <ShoppingCart size={24} strokeWidth={1.5} color="#1A1A1A" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </motion.button>

        {/* Center-right: Menu icon */}
        <motion.button
          whileTap={{ scale: 0.90 }}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
          aria-label="Menu"
        >
          <Menu size={24} strokeWidth={1.5} color="#1A1A1A" />
        </motion.button>

        {/* Right: Logo Bysis */}
        <img
          src="/manus-storage/BlackandWhiteMinimalistSimpleModernTechnologyAILogo_1887f3fe.png"
          alt="Bysis"
          className="w-6 h-6 object-contain ml-auto"
        />
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

        <TopHeader />

        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
        >
          {children}
        </main>

        {showNav && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col bg-white">
            <BottomNav onProfileClick={() => setProfileOpen(true)} />
            <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
          </div>
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
