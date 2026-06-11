/*
 * AppLayout — Main app shell with new Bottom Nav design
 * Bottom Nav: Lens | Suivi•• | Commander•• | AI
 * Colors: Black #121212, White #F2F2F7, Gold #D4AF37
 */
import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingBag } from 'lucide-react';
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
   BOTTOM NAV ICONS — New design with specific colors
───────────────────────────────────────────────────────────────────────────── */

/* Lens Icon */
function IcoLens() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="6" stroke="white" strokeWidth="2"/>
      <path d="M14 14L20 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 7V13M7 10H13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* AI Dots Icon */
function IcoAIDots() {
  return (
    <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="8" fill="white"/>
      <circle cx="50" cy="25" r="5" fill="white" opacity="0.8"/>
      <circle cx="64.1" cy="28.4" r="5" fill="white" opacity="0.8"/>
      <circle cx="71.6" cy="42.1" r="5" fill="white" opacity="0.8"/>
      <circle cx="64.1" cy="71.6" r="5" fill="white" opacity="0.8"/>
      <circle cx="50" cy="75" r="5" fill="white" opacity="0.8"/>
      <circle cx="35.9" cy="71.6" r="5" fill="white" opacity="0.8"/>
      <circle cx="28.4" cy="57.9" r="5" fill="white" opacity="0.8"/>
      <circle cx="35.9" cy="28.4" r="5" fill="white" opacity="0.8"/>
      <circle cx="50" cy="15" r="3" fill="white" opacity="0.6"/>
      <circle cx="70.7" cy="29.3" r="3" fill="white" opacity="0.6"/>
      <circle cx="85" cy="50" r="3" fill="white" opacity="0.6"/>
      <circle cx="70.7" cy="70.7" r="3" fill="white" opacity="0.6"/>
      <circle cx="50" cy="85" r="3" fill="white" opacity="0.6"/>
      <circle cx="29.3" cy="70.7" r="3" fill="white" opacity="0.6"/>
      <circle cx="15" cy="50" r="3" fill="white" opacity="0.6"/>
      <circle cx="29.3" cy="29.3" r="3" fill="white" opacity="0.6"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BOTTOM NAV — 4 buttons: Lens | Suivi•• | Commander•• | AI
───────────────────────────────────────────────────────────────────────────── */
interface BottomNavProps {
  onLensClick: () => void;
  onSuiviClick: () => void;
  onCommanderClick: () => void;
  onAIClick: () => void;
  visible: boolean;
}

function BottomNav({ onLensClick, onSuiviClick, onCommanderClick, onAIClick, visible }: BottomNavProps) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-white"
      style={{ borderTop: '1px solid #E5E5E5' }}
      animate={{ y: visible ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 0.8 }}
    >
      <div className="flex items-center justify-around px-4 py-3 gap-2">
        {/* Lens Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onLensClick}
          className="flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            background: '#121212',
            borderRadius: 14,
          }}
          aria-label="Lens"
        >
          <IcoLens />
        </motion.button>

        {/* Suivi•• Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onSuiviClick}
          className="flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            background: '#F2F2F7',
            borderRadius: 14,
          }}
          aria-label="Suivi"
        >
          <Package size={24} color="#121212" strokeWidth={2} />
        </motion.button>

        {/* Commander•• Button (Gold) */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onCommanderClick}
          className="flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            background: '#D4AF37',
            borderRadius: 14,
          }}
          aria-label="Commander"
        >
          <ShoppingBag size={24} color="#121212" strokeWidth={2} />
        </motion.button>

        {/* AI Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onAIClick}
          className="flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            background: '#121212',
            borderRadius: 14,
          }}
          aria-label="AI"
        >
          <IcoAIDots />
        </motion.button>
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

  const { openChat, chatOpen: isChatOpen }   = useChatContext();
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
    <>
      <div
        ref={mainRef}
        className="w-full overflow-y-auto"
        style={{
          height: '100vh',
          paddingBottom: showNav ? 'calc(75px + env(safe-area-inset-bottom, 0px))' : 0,
        }}
      >
        {children}
      </div>

      {showNav && (
        <BottomNav
          visible={navVisible}
          onLensClick={() => {}} // TODO: Implement lens/search
          onSuiviClick={() => {}} // TODO: Implement tracking
          onCommanderClick={() => {}} // TODO: Implement order
          onAIClick={handleChatOpen}
        />
      )}

      {/* ProfileSheet and AuthGateModal handled by context */}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   OUTER LAYOUT (with BgColorProvider)
───────────────────────────────────────────────────────────────────────────── */
export default function AppLayout(props: AppLayoutProps) {
  return (
    <BgColorProvider>
      <AppLayoutInner {...props} />
    </BgColorProvider>
  );
}
