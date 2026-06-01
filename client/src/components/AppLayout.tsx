/**
 * AppLayout — Main app shell (Amazon-style)
 *
 * Key behaviors:
 * 1. TopHeader is WHITE always — never changes color.
 * 2. Chatbot button (colored dots icon) lives INSIDE the search bar on the right.
 *    It disappears when user scrolls down, reappears on scroll up.
 * 3. Bottom Nav hides on scroll-down, shows on scroll-up (same as chatbot button).
 * 4. BoutiqueMenu slides in from the left.
 * 5. The carousel hero area handles its own color — the header stays white.
 */
import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingCart, User, Menu } from 'lucide-react';
import AuthGateModal from '@/components/AuthGateModal';
import ProfileSheet from '@/components/ProfileSheet';
import BoutiqueMenu from '@/components/BoutiqueMenu';
import { useCart } from '@/contexts/CartContext';
import { BgColorProvider } from '@/contexts/BgColorContext';
import { useChatContext } from '@/App';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  onChatOpen?: () => void;
}

/* ── Bysis AI Dots Icon (multi-colored, like Amazon Rufus) ─────────────────── */
function BysisAIIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="6"  cy="12" r="3.5" fill="#FF3131" />
      <circle cx="12" cy="12" r="3.5" fill="#F5C518" />
      <circle cx="18" cy="12" r="3.5" fill="#006A2E" />
    </svg>
  );
}

/* ── Top Header ────────────────────────────────────────────────────────────── */
interface TopHeaderProps {
  /** Whether the chatbot icon should be visible (hides on scroll-down) */
  chatVisible: boolean;
  onChatClick: () => void;
}

function TopHeader({ chatVisible, onChatClick }: TopHeaderProps) {
  const [, navigate] = useLocation();

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white"
      style={{ borderBottom: '1px solid #F0F0F0' }}
    >
      {/* Status bar safe area */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)', background: '#FFFFFF' }} />

      <div className="w-full px-3 py-2.5 flex items-center gap-2">
        {/* Search bar pill */}
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100"
          style={{ minHeight: 40 }}
        >
          {/* Search icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-gray-400">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>

          {/* Placeholder text */}
          <span
            className="flex-1 text-sm text-gray-400 select-none"
            onClick={() => navigate('/search')}
          >
            Rechercher ou poser une question
          </span>

          {/* Chatbot button — hides on scroll-down */}
          <AnimatePresence mode="popLayout">
            {chatVisible && (
              <motion.button
                key="chat-btn"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); onChatClick(); }}
                className="shrink-0 flex items-center justify-center"
                aria-label="Bysis AI"
              >
                <BysisAIIcon size={22} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Scanner / Camera button */}
        <button
          onClick={() => navigate('/scanner')}
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Scanner"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7"
              stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none"
            />
            <circle cx="12" cy="13" r="3" stroke="#1A1A1A" strokeWidth="2" fill="none" />
            <path d="M20 2 L20.5 4 L22.5 4.5 L20.5 5 L20 7 L19.5 5 L17.5 4.5 L19.5 4 Z" fill="#1A1A1A" />
          </svg>
        </button>
      </div>
    </header>
  );
}

/* ── Bottom Nav ─────────────────────────────────────────────────────────────── */
interface BottomNavProps {
  onProfileClick: () => void;
  onMenuClick?: () => void;
  visible: boolean;
}

function BottomNav({ onProfileClick, onMenuClick, visible }: BottomNavProps) {
  const [, navigate] = useLocation();
  const { totalItems } = useCart();

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white"
      style={{ borderTop: '1px solid #E5E5E5' }}
      animate={{ y: visible ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 0.8 }}
    >
      <div className="flex items-center justify-around px-4 py-3 gap-2">
        {/* Home */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Accueil"
        >
          <Home size={24} strokeWidth={1.6} color="#1A1A1A" />
        </motion.button>

        {/* Profile */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onProfileClick}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Profil"
        >
          <User size={24} strokeWidth={1.6} color="#1A1A1A" />
        </motion.button>

        {/* Cart */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate('/panier')}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Panier"
        >
          <ShoppingCart size={24} strokeWidth={1.6} color="#1A1A1A" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </motion.button>

        {/* Hamburger Menu */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onMenuClick}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <Menu size={24} strokeWidth={1.6} color="#1A1A1A" />
        </motion.button>
      </div>
      {/* Safe area bottom */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)', background: '#FFFFFF' }} />
    </motion.div>
  );
}

/* ── Inner Layout ─────────────────────────────────────────────────────────── */
function AppLayoutInner({ children, showNav = true, onChatOpen }: AppLayoutProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);

  // Both chatbot icon and bottom nav hide/show together on scroll
  const [navVisible, setNavVisible]   = useState(true);

  const { openChat }      = useChatContext();
  const handleChatOpen    = onChatOpen ?? openChat;

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

      // Hide on scroll-down (delta > 4px), show on any upward scroll (delta < -1px)
      if (delta > 4)       setNavVisible(false);
      else if (delta < -1) setNavVisible(true);
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

  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      style={{ fontFamily: '"Inter", -apple-system, sans-serif' }}
    >
      <AuthGateModal open={authOpen} onClose={() => setAuthOpen(false)} action="order" />
      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
      <BoutiqueMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── White sticky header with chatbot icon inside search bar ── */}
      <TopHeader chatVisible={navVisible} onChatClick={handleChatOpen} />

      {/* ── Main scrollable content ── */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto bg-white"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
      >
        {children}
      </main>

      {/* ── Bottom Nav — hides/shows with scroll ── */}
      {showNav && (
        <BottomNav
          onProfileClick={() => setProfileOpen(true)}
          onMenuClick={() => setMenuOpen(true)}
          visible={navVisible}
        />
      )}
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
