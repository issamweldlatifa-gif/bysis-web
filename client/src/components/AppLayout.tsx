import { useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, User, ShoppingCart, Menu, Search } from 'lucide-react';
import AuthGateModal from '@/components/AuthGateModal';
import ProfileSheet from '@/components/ProfileSheet';
import { useCart } from '@/contexts/CartContext';
import { BgColorProvider } from '@/contexts/BgColorContext';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  onChatOpen?: () => void;
}

/* ── Amazon Lens Icon ── */
function AmazonLensIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="15" rx="2" stroke="#CCCCCC" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="13" r="3.5" stroke="#CCCCCC" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="13" r="1.2" fill="#CCCCCC" />
      <path d="M8 5V4a1 1 0 011-1h6a1 1 0 011 1v1" stroke="#CCCCCC" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 2 L19.5 3.5 L21 4 L19.5 4.5 L19 6 L18.5 4.5 L17 4 L18.5 3.5 Z" fill="#FF9900" />
    </svg>
  );
}

/* ── Amazon Header ── */
function AppHeader({ onScanClick }: { onScanClick: () => void }) {
  const [, navigate] = useLocation();
  return (
    <header className="sticky top-0 z-40 w-full">
      {/* iOS safe area spacer */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)', background: '#131921' }} />

      {/* Main header row */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#131921' }}>
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex-shrink-0 flex items-center mr-1"
          style={{ background: 'transparent', border: 'none' }}
        >
          <span
            className="font-black text-xl"
            style={{ color: '#FF9900', fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.03em' }}
          >
            bysis
          </span>
        </button>

        {/* Search bar */}
        <div
          className="flex-1 flex items-center bg-white overflow-hidden"
          style={{ height: '42px', border: '2px solid #FF9900', borderRadius: '4px' }}
        >
          <Search size={17} strokeWidth={2} color="#565959" className="ml-3 flex-shrink-0" />
          <span
            className="flex-1 px-2 text-sm truncate select-none"
            style={{ color: '#888', fontFamily: '"Nunito", sans-serif' }}
          >
            Rechercher ou poser une question
          </span>
          {/* Lens button */}
          <button
            onClick={onScanClick}
            className="flex-shrink-0 flex items-center justify-center w-10 h-full transition-colors"
            style={{ background: '#F3F3F3', borderLeft: '1px solid #D5D9D9' }}
            aria-label="Recherche par image"
          >
            <AmazonLensIcon />
          </button>
        </div>
      </div>

      {/* Location bar */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5"
        style={{ background: '#232F3E', borderTop: '1px solid #3A4553' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="text-xs" style={{ color: '#AAAAAA' }}>Livrer en</span>
        <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>Tunisie</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </header>
  );
}

/* ── Amazon Bottom Nav ── */
function BottomNav({ onProfileClick }: { onProfileClick: () => void }) {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();

  const tabs = [
    { id: 'home',   label: 'Accueil', Icon: Home,         href: '/',        action: null },
    { id: 'compte', label: 'Compte',  Icon: User,         href: null,       action: onProfileClick },
    { id: 'panier', label: 'Panier',  Icon: ShoppingCart, href: '/panier',  action: null },
    { id: 'menu',   label: 'Menu',    Icon: Menu,         href: null,       action: onProfileClick },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: '#131921',
        borderTop: '1px solid #3A4553',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
      }}
    >
      <div className="flex items-center justify-around pt-2 px-2">
        {tabs.map((tab) => {
          const isActive = tab.href ? location === tab.href : false;
          const { Icon } = tab;
          const isPanier = tab.id === 'panier';

          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                if (tab.action) tab.action();
                else if (tab.href) navigate(tab.href);
              }}
              whileTap={{ scale: 0.88 }}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px] relative"
              style={{ background: 'transparent', border: 'none' }}
            >
              <span className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  color={isActive ? '#FF9900' : '#CCCCCC'}
                />
                {isPanier && totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{ background: '#FF9900', color: '#0F1111' }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? '#FF9900' : '#CCCCCC' }}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.span
                  layoutId="navActiveBar"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full"
                  style={{ background: '#FF9900' }}
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

/* ── Sisi AI Floating Button ── */
function SisiButton({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.05 }}
      className="fixed z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
        right: '16px',
        background: 'linear-gradient(135deg, #131921, #232F3E)',
        border: '1.5px solid #3A4553',
      }}
      aria-label="Sisi AI"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#FF9900">
        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z" />
        <path d="M19 2L19.8 4.2L22 5L19.8 5.8L19 8L18.2 5.8L16 5L18.2 4.2Z" />
      </svg>
      <span className="text-xs font-bold" style={{ color: '#FF9900', fontFamily: '"Nunito", sans-serif' }}>
        Sisi AI
      </span>
    </motion.button>
  );
}

/* ── Inner Layout ── */
function AppLayoutInner({ children, showNav = true, onChatOpen }: AppLayoutProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen]       = useState(false);
  const [, navigate]                  = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#F3F3F3', fontFamily: '"Nunito", "Inter", sans-serif' }}
    >
      <div className="fixed z-0" style={{ background: '#F3F3F3', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }} />

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

        {showNav && <SisiButton onClick={onChatOpen} />}
        {showNav && <BottomNav onProfileClick={() => setProfileOpen(true)} />}
      </div>
    </div>
  );
}

/* ── Public export ── */
export default function AppLayout(props: AppLayoutProps) {
  return (
    <BgColorProvider>
      <AppLayoutInner {...props} />
    </BgColorProvider>
  );
}
