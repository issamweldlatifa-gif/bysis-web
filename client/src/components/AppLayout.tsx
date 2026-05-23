'use client';

import { useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  List, X,
  Scan, ClockCounterClockwise, ShoppingCart, ChatCircleText,
  House, Calculator, Storefront, MagnifyingGlass,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  onAboutClick?: () => void;
  onChatOpen?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  isChat?: boolean;
}

const navItems: NavItem[] = [
  { id: 'scan',     label: 'Scan',       icon: Scan,                   href: '/calculator' },
  { id: 'history',  label: 'Historique', icon: ClockCounterClockwise,  href: '/history' },
  { id: 'orders',   label: 'Commandes',  icon: ShoppingCart,           href: '/orders' },
  { id: 'boutique', label: 'Boutique',   icon: Storefront,             href: '/arrivage' },
  { id: 'chat',     label: 'Chat',       icon: ChatCircleText,         href: '/chat', isChat: true },
];

const menuItems = [
  { label: 'Accueil',            href: '/',           icon: House },
  { label: 'Calculer le prix',   href: '/calculator', icon: Calculator },
  { label: 'Mes commandes',      href: '/orders',     icon: ShoppingCart },
  { label: 'Boutique',           href: '/arrivage',   icon: Storefront },
  { label: 'Suivre ma commande', href: '/track',      icon: MagnifyingGlass },
];

/* ── PayPal Design System ─────────────────────────────────────────────── */
const PP_BG        = '#EEF2F7';   // PayPal page background
const PP_WHITE     = '#FFFFFF';   // PayPal card white
const PP_BLUE      = '#0070BA';   // PayPal Blue
const PP_NAVY      = '#003087';   // PayPal Navy
const PP_TEXT      = '#2C2E2F';   // PayPal Near-Black
const PP_MUTED     = '#6C7378';   // PayPal Gray
const PP_BORDER    = '#CBD2D9';   // PayPal Border
const PP_ACTIVE_BG = '#EBF4FB';   // PayPal Blue tint

function AppHeader({ menuOpen, onMenuToggle }: { menuOpen: boolean; onMenuToggle: () => void }) {
  const [, navigate] = useLocation();
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="sticky top-0 z-40 safe-area-left safe-area-right"
      style={{
        background: PP_WHITE,
        borderBottom: `1px solid ${PP_BORDER}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}
    >
      <div className="flex items-center justify-between h-14 px-4 safe-area-top">
        {/* Hamburger */}
        <button
          onClick={onMenuToggle}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-[#EEF2F7]"
          style={{ color: PP_TEXT }}
        >
          {menuOpen
            ? <X size={20} weight="bold" />
            : <List size={20} weight="bold" />}
        </button>

        {/* Logo — PayPal-style wordmark */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5"
        >
          {/* B icon — PayPal-style blue rounded square */}
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-black"
            style={{ background: `linear-gradient(145deg, ${PP_BLUE}, ${PP_NAVY})` }}
          >
            B
          </span>
          <span
            className="text-[19px] font-extrabold tracking-tight"
            style={{ color: PP_NAVY, letterSpacing: '-0.03em' }}
          >
            bysis
          </span>
        </button>

        <div className="w-9" />
      </div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{
              borderTop: `1px solid ${PP_BORDER}`,
              background: PP_WHITE,
              boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
            }}
          >
            <div className="flex flex-col py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={onMenuToggle}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-all duration-150 hover:bg-[#EBF4FB] border-l-[3px] border-transparent hover:border-[#0070BA]"
                    style={{ color: PP_TEXT, fontFamily: 'Inter, sans-serif' }}
                  >
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: PP_ACTIVE_BG }}
                    >
                      <Icon size={16} weight="duotone" style={{ color: PP_BLUE }} />
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function BottomNav({ onChatOpen }: { onChatOpen?: () => void }) {
  const [location] = useLocation();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40 safe-area-left safe-area-right"
      style={{
        background: PP_WHITE,
        borderTop: `1px solid ${PP_BORDER}`,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-around h-[62px] px-1 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (location === '/chat' && item.isChat);

          if (item.isChat) {
            return (
              <motion.button
                key={item.id}
                onClick={onChatOpen}
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-150"
                style={{ color: PP_MUTED }}
              >
                <Icon size={22} weight="regular" />
                <span className="text-[10px] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
              </motion.button>
            );
          }

          return (
            <motion.a
              key={item.id}
              href={item.href}
              whileTap={{ scale: 0.88 }}
              className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-150 relative"
              style={{ color: isActive ? PP_BLUE : PP_MUTED }}
            >
              {isActive && (
                <motion.span
                  layoutId="navActivePill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: PP_ACTIVE_BG }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                weight={isActive ? 'fill' : 'regular'}
                style={{ position: 'relative', zIndex: 1 }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ position: 'relative', zIndex: 1, fontFamily: 'Inter, sans-serif' }}
              >
                {item.label}
              </span>
            </motion.a>
          );
        })}
      </div>
    </motion.nav>
  );
}

export default function AppLayout({ children, showNav = true, onAboutClick, onChatOpen }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: PP_BG, color: PP_TEXT, fontFamily: 'Inter, -apple-system, sans-serif' }}
    >
      <AppHeader menuOpen={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} />

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.18)' }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto pb-20 safe-area-left safe-area-right">
        {children}
      </main>

      {showNav && <BottomNav onChatOpen={onChatOpen} />}
    </div>
  );
}
