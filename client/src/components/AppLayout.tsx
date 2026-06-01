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
 * 6. Bottom Nav: 4 tabs (Accueil, Boutiques, Panier, Moi) with labels + active state.
 */
import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
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

/* ── Bottom Nav Icons ───────────────────────────────────────────────────────── */
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        fill={active ? '#0A0A0A' : 'none'}
        stroke={active ? '#0A0A0A' : '#888'}
        strokeWidth={active ? '0' : '1.8'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGrid({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5"
        fill={active ? '#0A0A0A' : 'none'}
        stroke={active ? '#0A0A0A' : '#888'}
        strokeWidth={active ? '0' : '1.8'}
      />
      <rect x="13" y="3" width="8" height="8" rx="1.5"
        fill={active ? '#0A0A0A' : 'none'}
        stroke={active ? '#0A0A0A' : '#888'}
        strokeWidth={active ? '0' : '1.8'}
      />
      <rect x="3" y="13" width="8" height="8" rx="1.5"
        fill={active ? '#0A0A0A' : 'none'}
        stroke={active ? '#0A0A0A' : '#888'}
        strokeWidth={active ? '0' : '1.8'}
      />
      <rect x="13" y="13" width="8" height="8" rx="1.5"
        fill={active ? '#0A0A0A' : 'none'}
        stroke={active ? '#0A0A0A' : '#888'}
        strokeWidth={active ? '0' : '1.8'}
      />
    </svg>
  );
}

function IconCart({ active, badge }: { active: boolean; badge?: number }) {
  return (
    <div className="relative">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
          fill={active ? '#0A0A0A' : 'none'}
          stroke={active ? '#0A0A0A' : '#888'}
          strokeWidth={active ? '0' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {!active && <line x1="3" y1="6" x2="21" y2="6" stroke="#888" strokeWidth="1.8" />}
        {!active && <path d="M16 10a4 4 0 01-8 0" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />}
        {active && <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="1.8" />}
        {active && <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />}
      </svg>
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
          style={{ background: '#E8192C', minWidth: '18px', minHeight: '18px', padding: '0 3px', lineHeight: 1 }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
  );
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12" cy="8" r="4"
        fill={active ? '#0A0A0A' : 'none'}
        stroke={active ? '#0A0A0A' : '#888'}
        strokeWidth={active ? '0' : '1.8'}
      />
      <path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        fill={active ? '#0A0A0A' : 'none'}
        stroke={active ? '#0A0A0A' : '#888'}
        strokeWidth={active ? '0' : '1.8'}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Top Header ────────────────────────────────────────────────────────────── */
interface TopHeaderProps {
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

const NAV_TABS = [
  { id: 'home',     path: '/',        label: 'Accueil' },
  { id: 'boutique', path: '/arrivage', label: 'Boutiques' },
  { id: 'panier',   path: '/panier',  label: 'Panier' },
  { id: 'moi',      path: null,       label: 'Moi' },
] as const;

function BottomNav({ onProfileClick, onMenuClick: _onMenuClick, visible }: BottomNavProps) {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();

  const isActive = (path: string | null) => {
    if (path === null) return false;
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  const handleTab = (tab: typeof NAV_TABS[number]) => {
    if (tab.id === 'moi') {
      onProfileClick();
    } else if (tab.path) {
      navigate(tab.path);
    }
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white"
      style={{ borderTop: '1px solid #E5E5E5' }}
      animate={{ y: visible ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 0.8 }}
    >
      <div className="flex items-stretch justify-around px-2 pt-2 pb-1 gap-1">
        {NAV_TABS.map((tab) => {
          const active = tab.id === 'moi' ? false : isActive(tab.path);
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleTab(tab)}
              className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl gap-1 transition-colors"
              style={{ minHeight: 52 }}
              aria-label={tab.label}
            >
              {/* Icon */}
              {tab.id === 'home' && <IconHome active={active} />}
              {tab.id === 'boutique' && <IconGrid active={active} />}
              {tab.id === 'panier' && <IconCart active={active} badge={totalItems} />}
              {tab.id === 'moi' && <IconUser active={active} />}

              {/* Label */}
              <span
                className="text-[10px] font-semibold leading-none"
                style={{ color: active ? '#0A0A0A' : '#888888' }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
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
