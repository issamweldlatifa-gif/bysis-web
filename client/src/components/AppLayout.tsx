/**
 * AppLayout — Main app shell
 * All icons: clean Outline / Line-Art style, stroke 1.8px, Lucide-compatible
 */
import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import AuthGateModal from '@/components/AuthGateModal';
import ProfileSheet from '@/components/ProfileSheet';
import { useCart } from '@/contexts/CartContext';
import { BgColorProvider, useBgColor } from '@/contexts/BgColorContext';
import { useChatContext } from '@/App';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  onChatOpen?: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   ICON SYSTEM — all outline, stroke="currentColor", strokeWidth="1.8"
   Active color: #111111 (near-black)   Inactive color: #9CA3AF (gray-400)
───────────────────────────────────────────────────────────────────────────── */

const STROKE = '1.8';
const ACTIVE_COLOR   = '#111111';
const INACTIVE_COLOR = '#9CA3AF';

/* Home */
function IcoHome({ active }: { active: boolean }) {
  const c = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  const sw = active ? '2.2' : STROKE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  );
}

/* Grid / Boutiques */
function IcoGrid({ active }: { active: boolean }) {
  const c = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  const sw = active ? '2.2' : STROKE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
}

/* Shopping Bag / Panier */
function IcoBag({ active, badge }: { active: boolean; badge?: number }) {
  const c = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  const sw = active ? '2.2' : STROKE;
  return (
    <div className="relative">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-white font-bold"
          style={{ background: '#E8192C', fontSize: 9, minWidth: 16, height: 16, padding: '0 3px', lineHeight: 1 }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
  );
}

/* User / Moi */
function IcoUser({ active }: { active: boolean }) {
  const c = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  const sw = active ? '2.2' : STROKE;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"/>
    </svg>
  );
}

/* Search */
function IcoSearch() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <line x1="16.5" y1="16.5" x2="21" y2="21"/>
    </svg>
  );
}

/* Camera / Scanner */
function IcoCamera() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

/* Bysis AI dots (colored — brand identity, not a line icon) */
function IcoAI({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="6"  cy="12" r="3" fill="#FF3131"/>
      <circle cx="12" cy="12" r="3" fill="#F5C518"/>
      <circle cx="18" cy="12" r="3" fill="#006A2E"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOP HEADER
───────────────────────────────────────────────────────────────────────────── */
interface TopHeaderProps {
  chatVisible: boolean;
  onChatClick: () => void;
  headerBgColor?: string;
}

function TopHeader({ chatVisible, onChatClick, headerBgColor = '#FFFFFF' }: TopHeaderProps) {
  const [, navigate] = useLocation();
  const isColored = headerBgColor !== '#FFFFFF' && headerBgColor !== '#ffffff';

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: headerBgColor,
        transition: 'background-color 0.5s ease',
        borderBottom: isColored ? 'none' : '1px solid #F0F0F0',
      }}
    >
      <div style={{ height: 'env(safe-area-inset-top, 0px)', background: 'inherit' }} />
      <div className="w-full px-3 py-2.5 flex items-center gap-2">
        {/* Search bar — ALWAYS white background, ALWAYS dark text/icon */}
        <button
          onClick={() => navigate('/search')}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full"
          style={{
            minHeight: 40,
            background: '#FFFFFF',
            boxShadow: isColored ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <span
            className="flex-1 text-sm text-left select-none"
            style={{ color: '#9CA3AF' }}
          >
            Rechercher ou poser une question
          </span>
          <AnimatePresence mode="popLayout">
            {chatVisible && (
              <motion.span
                key="ai-dots"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                onClick={(e) => { e.stopPropagation(); onChatClick(); }}
                className="shrink-0 flex items-center justify-center"
              >
                <IcoAI size={20} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Camera / Scanner button — ALWAYS white background, ALWAYS dark icon */}
        <button
          onClick={() => navigate('/scanner')}
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
          style={{
            background: '#FFFFFF',
            boxShadow: isColored ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
          }}
          aria-label="Scanner"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#111111"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BOTTOM NAV — 5 tabs: Accueil | Boutiques | [AI FAB] | Panier | Moi
───────────────────────────────────────────────────────────────────────────── */
interface BottomNavProps {
  onProfileClick: () => void;
  onChatClick: () => void;
  visible: boolean;
}

const NAV_TABS = [
  { id: 'home',     path: '/',         label: 'Accueil'   },
  { id: 'boutique', path: '/arrivage', label: 'Boutiques' },
  { id: 'chat',     path: null,        label: 'AI'        },
  { id: 'panier',   path: '/panier',   label: 'Panier'    },
  { id: 'moi',      path: null,        label: 'Moi'       },
] as const;

function BottomNav({ onProfileClick, onChatClick, visible }: BottomNavProps) {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();

  const isActive = (path: string | null) => {
    if (!path) return false;
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  const handleTab = (tab: typeof NAV_TABS[number]) => {
    if (tab.id === 'moi')  { onProfileClick(); return; }
    if (tab.id === 'chat') { onChatClick();    return; }
    if (tab.path) navigate(tab.path);
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white"
      style={{ borderTop: '1px solid #E5E5E5' }}
      animate={{ y: visible ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 0.8 }}
    >
      <div className="flex items-end justify-around px-1 pt-2 pb-1">
        {NAV_TABS.map((tab) => {
          const active = isActive(tab.path);

          /* ── AI FAB (center) ── */
          if (tab.id === 'chat') {
            return (
              <div key="chat" className="flex flex-col items-center justify-end flex-1">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={onChatClick}
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 50,
                    height: 50,
                    background: '#111111',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
                    marginBottom: 4,
                  }}
                  aria-label="Bysis AI"
                >
                  <IcoAI size={22} />
                </motion.button>
                <span className="text-[10px] font-semibold" style={{ color: INACTIVE_COLOR }}>AI</span>
              </div>
            );
          }

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleTab(tab)}
              className="flex flex-col items-center justify-center flex-1 py-1.5 gap-1"
              style={{ minHeight: 52 }}
              aria-label={tab.label}
            >
              {tab.id === 'home'     && <IcoHome     active={active} />}
              {tab.id === 'boutique' && <IcoGrid     active={active} />}
              {tab.id === 'panier'   && <IcoBag      active={active} badge={totalItems} />}
              {tab.id === 'moi'      && <IcoUser     active={active} />}
              <span
                className="text-[10px] font-semibold leading-none"
                style={{ color: active ? ACTIVE_COLOR : INACTIVE_COLOR }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)', background: '#FFFFFF' }} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   INNER LAYOUT
───────────────────────────────────────────────────────────────────────────── */
function AppLayoutInner({ children, showNav = true, onChatOpen }: AppLayoutProps) {
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [authOpen,     setAuthOpen]     = useState(false);
  const [navVisible,   setNavVisible]   = useState(true);

  const { carouselColor } = useBgColor();

  const { openChat }   = useChatContext();
  const handleChatOpen = onChatOpen ?? openChat;

  const mainRef     = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const rafRef      = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = mainRef.current;
      if (!el) return;
      const scrollY = el.scrollTop;
      const delta = scrollY - lastScrollY.current;
      lastScrollY.current = scrollY;
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
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: '"Inter", -apple-system, sans-serif' }}>
      <AuthGateModal open={authOpen} onClose={() => setAuthOpen(false)} action="order" />
      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />

      <TopHeader chatVisible={navVisible} onChatClick={handleChatOpen} headerBgColor={carouselColor} />

      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto bg-white"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
      >
        {children}
      </main>

      {showNav && (
        <BottomNav
          onProfileClick={() => setProfileOpen(true)}
          onChatClick={handleChatOpen}
          visible={navVisible}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PUBLIC EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function AppLayout(props: AppLayoutProps) {
  return (
    <BgColorProvider>
      <AppLayoutInner {...props} />
    </BgColorProvider>
  );
}
