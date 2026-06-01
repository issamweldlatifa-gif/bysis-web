/**
 * AppLayout — Main app shell
 *
 * Key behaviors:
 * 1. TopHeader is sticky — its background color matches the carousel color,
 *    fading to white as the user scrolls down.
 * 2. FAB (Bysis AI button) hides on scroll-down, reappears on any upward scroll.
 * 3. BoutiqueMenu slides in from the left.
 * 4. Status bar color (meta theme-color) follows the carousel color.
 */
import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingCart, User, Search, Menu } from 'lucide-react';
import AuthGateModal from '@/components/AuthGateModal';
import ProfileSheet from '@/components/ProfileSheet';
import BoutiqueMenu from '@/components/BoutiqueMenu';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BgColorProvider, useBgColor } from '@/contexts/BgColorContext';
import { useChatContext } from '@/App';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  onChatOpen?: () => void;
}

/* ── Color helpers ─────────────────────────────────────────────────────────── */
function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '').replace(/^rgb\(.*\)$/, '').padEnd(6, '0');
  // handle rgb() strings too
  if (hex.startsWith('rgb')) {
    const m = hex.match(/\d+/g);
    if (m) return [+m[0], +m[1], +m[2]];
  }
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

function isLight(color: string): boolean {
  const [r, g, b] = hexToRgb(color);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

/* ── Google Lens Icon ─────────────────────────────────────────────────────── */
function GoogleLensIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none"
      />
      <circle cx="12" cy="13" r="3.5" stroke={color} strokeWidth="2" fill="none" />
      <path d="M20 2 L20.6 4.4 L23 5 L20.6 5.6 L20 8 L19.4 5.6 L17 5 L19.4 4.4 Z" fill={color} />
    </svg>
  );
}

/* ── Top Header ────────────────────────────────────────────────────────────── */
interface TopHeaderProps {
  /** 0 = fully carousel-colored, 1 = fully white */
  fadeRatio: number;
  carouselColor: string;
}

function TopHeader({ fadeRatio, carouselColor }: TopHeaderProps) {
  const [, navigate] = useLocation();

  // Interpolate header background between carousel color and white
  const headerBg = lerpColor(carouselColor, '#ffffff', fadeRatio);
  const light = isLight(carouselColor);

  // Icon/text color: adapts to carousel bg, fades to dark as header goes white
  const iconColor = lerpColor(
    light ? '#0a0a0a' : '#ffffff',
    '#0a0a0a',
    fadeRatio
  );
  const inputBg = lerpColor(
    light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)',
    '#f3f4f6',
    fadeRatio
  );

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{ background: headerBg }}
    >
      {/* Status bar safe area — same color as header */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)', background: headerBg }} />
      <div className="w-full px-4 py-3 flex items-center gap-3">
        <Search size={20} color={iconColor} style={{ opacity: 0.6 }} />
        <input
          type="text"
          placeholder="Rechercher ou poser une question"
          className="flex-1 rounded-full px-4 py-2 text-sm outline-none"
          style={{ background: inputBg, color: iconColor }}
        />
        <button
          onClick={() => navigate('/scanner')}
          className="flex items-center justify-center w-8 h-8 rounded transition-colors"
          aria-label="Scanner"
        >
          <GoogleLensIcon color={iconColor} />
        </button>
      </div>
    </header>
  );
}

/* ── Bottom Nav ─────────────────────────────────────────────────────────────── */
function BottomNav({
  onProfileClick,
  onAIChatClick,
  onMenuClick,
  fabVisible,
}: {
  onProfileClick: () => void;
  onAIChatClick?: () => void;
  onMenuClick?: () => void;
  fabVisible: boolean;
}) {
  const [, navigate] = useLocation();
  const { totalItems } = useCart();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
      className="w-full"
      style={{ background: '#FFFFFF', borderTop: '1px solid #E5E5E5' }}
    >
      <div className="flex items-center justify-around px-4 py-3 gap-2">
        {/* Home */}
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
          aria-label="Accueil"
        >
          <Home size={24} strokeWidth={1.5} color="#1A1A1A" />
        </motion.button>

        {/* Profile */}
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={onProfileClick}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
          aria-label="Profil"
        >
          <User size={24} strokeWidth={1.5} color="#1A1A1A" />
        </motion.button>

        {/* Cart */}
        <motion.button whileTap={{ scale: 0.9 }}
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

        {/* Hamburger Menu */}
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={onMenuClick}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
          aria-label="Menu"
        >
          <Menu size={24} strokeWidth={1.5} color="#1A1A1A" />
        </motion.button>

        {/* Bysis AI FAB — hides on scroll-down, shows on scroll-up */}
        <AnimatePresence mode="popLayout">
          {fabVisible && (
            <motion.button
              key="fab"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              whileTap={{ scale: 0.88 }}
              onClick={onAIChatClick}
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
              aria-label="Bysis AI"
            >
              <img
                src="/manus-storage/BlackandWhiteMinimalistSimpleModernTechnologyAILogo_7e8b089f.png"
                alt="Bysis AI"
                className="w-6 h-6 object-contain"
              />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

/* ── Inner Layout ─────────────────────────────────────────────────────────── */
function AppLayoutInner({ children, showNav = true, onChatOpen }: AppLayoutProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [fabVisible, setFabVisible]   = useState(true);
  const [fadeRatio, setFadeRatio]     = useState(0);

  const { theme }                     = useTheme();
  const isDark                        = theme === 'dark';
  const { openChat }                  = useChatContext();
  const { carouselColor }             = useBgColor();
  const handleChatOpen                = onChatOpen ?? openChat;

  const mainRef     = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const rafRef      = useRef<number | null>(null);

  /* ── Scroll handler ───────────────────────────────────────────────────── */
  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = mainRef.current;
      if (!el) return;
      const scrollY = el.scrollTop;
      const delta = scrollY - lastScrollY.current;
      lastScrollY.current = scrollY;

      // FAB: hide when scrolling down (delta > 4px), show on any upward scroll
      if (delta > 4) setFabVisible(false);
      else if (delta < -1) setFabVisible(true);

      // Header fade: 0 = carousel color, 1 = white
      // Fade completes after scrolling ~60% of carousel height (~380px)
      const FADE_DISTANCE = 230;
      const ratio = Math.min(1, Math.max(0, scrollY / FADE_DISTANCE));
      setFadeRatio(ratio);
    });
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const pageBg = isDark ? '#0D0D0F' : '#FFFFFF';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: '"Inter", -apple-system, sans-serif', background: pageBg }}
    >
      <div className="relative z-10 flex flex-col min-h-screen">
        <AuthGateModal open={authOpen} onClose={() => setAuthOpen(false)} action="order" />
        <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
        <BoutiqueMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* Header: color fades from carousel color to white as user scrolls */}
        <TopHeader fadeRatio={fadeRatio} carouselColor={carouselColor} />

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto bg-white"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
        >
          {children}
        </main>

        {showNav && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col bg-white">
            <BottomNav
              onProfileClick={() => setProfileOpen(true)}
              onAIChatClick={handleChatOpen}
              onMenuClick={() => setMenuOpen(true)}
              fabVisible={fabVisible}
            />
            <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Public export ─────────────────────────────────────────────────────────── */
export default function AppLayout(props: AppLayoutProps) {
  return (
    <BgColorProvider>
      <AppLayoutInner {...props} />
    </BgColorProvider>
  );
}
