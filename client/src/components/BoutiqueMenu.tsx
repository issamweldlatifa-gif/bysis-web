/**
 * BoutiqueMenu — Amazon-style slide-in categories menu
 *
 * Opens from the left when user taps the hamburger (≡) icon.
 * Sections:
 *   1. User greeting (avatar + name if logged in)
 *   2. Vos raccourcis
 *   3. Acheter par catégorie (expandable rows)
 *   4. Aide & Paramètres
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronRight, User, Settings, HelpCircle, LogIn } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface Category {
  icon: string;
  label: string;
  path?: string;
  children?: { label: string; path: string }[];
}

/* ── Data ──────────────────────────────────────────────────────────────────── */
const SHORTCUTS = [
  { icon: '🛒', label: 'Commander', path: '/order' },
  { icon: '📍', label: 'Suivre ma commande', path: '/track' },
  { icon: '📦', label: 'Arrivages', path: '/arrivage' },
  { icon: '🧮', label: 'Calculateur de prix', path: '/calculator' },
];

const CATEGORIES: Category[] = [
  {
    icon: '🏪',
    label: 'Boutiques du jour',
    children: [
      { label: 'Nouveautés', path: '/arrivage' },
      { label: 'Meilleures ventes', path: '/arrivage' },
    ],
  },
  {
    icon: '⚡',
    label: 'Bonnes affaires & économies',
    children: [
      { label: 'Ventes flash', path: '/order' },
      { label: 'Promotions', path: '/order' },
    ],
  },
  {
    icon: '👗',
    label: 'Mode & Beauté',
    children: [
      { label: 'Vêtements', path: '/order' },
      { label: 'Chaussures', path: '/order' },
      { label: 'Accessoires', path: '/order' },
      { label: 'Cosmétiques', path: '/order' },
    ],
  },
  {
    icon: '📱',
    label: 'Appareils & Électronique',
    children: [
      { label: 'Smartphones', path: '/order' },
      { label: 'Accessoires tech', path: '/order' },
      { label: 'Informatique', path: '/order' },
    ],
  },
  {
    icon: '🏠',
    label: 'Maison & Bricolage',
    children: [
      { label: 'Décoration', path: '/order' },
      { label: 'Cuisine', path: '/order' },
      { label: 'Jardinage', path: '/order' },
    ],
  },
  {
    icon: '🧸',
    label: 'Jouets & Enfants',
    children: [
      { label: 'Jouets', path: '/order' },
      { label: 'Puériculture', path: '/order' },
    ],
  },
  {
    icon: '💊',
    label: 'Pharmacie & Soins',
    children: [
      { label: 'Soins du corps', path: '/order' },
      { label: 'Compléments', path: '/order' },
    ],
  },
  {
    icon: '🐾',
    label: 'Animaux de compagnie',
    children: [
      { label: 'Alimentation', path: '/order' },
      { label: 'Accessoires', path: '/order' },
    ],
  },
];

/* ── Animation variants ────────────────────────────────────────────────────── */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.22 } },
};

const panelVariants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { type: 'spring' as const, stiffness: 340, damping: 36, mass: 0.9 } },
  exit: { x: '-100%', transition: { type: 'spring' as const, stiffness: 400, damping: 40, mass: 0.7 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.18, ease: 'easeOut' as const },
  }),
};

/* ── Category Row ──────────────────────────────────────────────────────────── */
function CategoryRow({
  category,
  index,
  onNavigate,
}: {
  category: Category;
  index: number;
  onNavigate: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div custom={index} variants={itemVariants} initial="hidden" animate="visible">
      <button
        onClick={() => {
          if (category.children?.length) {
            setExpanded((v) => !v);
          } else if (category.path) {
            onNavigate(category.path);
          }
        }}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <span className="text-xl w-7 flex-none">{category.icon}</span>
        <span className="flex-1 text-sm font-medium text-gray-800">{category.label}</span>
        {category.children?.length ? (
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-gray-400" />
          </motion.span>
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        )}
      </button>

      {/* Sub-items */}
      <AnimatePresence initial={false}>
        {expanded && category.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden bg-gray-50"
          >
            {category.children.map((child) => (
              <button
                key={child.label}
                onClick={() => onNavigate(child.path)}
                className="w-full flex items-center gap-3 pl-14 pr-4 py-3 text-left hover:bg-gray-100 active:bg-gray-200 transition-colors border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">{child.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────────── */
interface BoutiqueMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoutiqueMenu({ isOpen, onClose }: BoutiqueMenuProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const handleNavigate = (path: string) => {
    onClose();
    setTimeout(() => navigate(path), 180);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="boutique-backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[9990] bg-black/40"
            onClick={onClose}
          />

          {/* Slide-in panel */}
          <motion.div
            key="boutique-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 bottom-0 z-[9991] bg-white flex flex-col overflow-hidden"
            style={{ width: 'min(85vw, 360px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-[#131921]">
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl ?? ''} alt={user.name ?? ''} className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} color="white" />
                      )}
                    </div>
                    <div>
                      <p className="text-white/70 text-xs">Bonjour,</p>
                      <p className="text-white font-bold text-sm">{user.name}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                      <User size={18} color="white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs">Bonjour,</p>
                      <p className="text-white font-bold text-sm">Connectez-vous</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} color="white" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Vos raccourcis */}
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vos raccourcis</p>
                <div className="grid grid-cols-2 gap-2">
                  {SHORTCUTS.map((s, i) => (
                    <motion.button
                      key={s.path}
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigate(s.path)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors text-left"
                    >
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-xs font-semibold text-gray-700">{s.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-2 bg-gray-100 my-3" />

              {/* Acheter par catégorie */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 pb-2">
                  Acheter par catégorie
                </p>
                <div className="divide-y divide-gray-100">
                  {CATEGORIES.map((cat, i) => (
                    <CategoryRow
                      key={cat.label}
                      category={cat}
                      index={i}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-2 bg-gray-100 my-3" />

              {/* Aide & Paramètres */}
              <div className="divide-y divide-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-2">
                  Aide & Paramètres
                </p>
                {[
                  { icon: <Settings size={18} />, label: 'Paramètres', path: '/parametres' },
                  { icon: <HelpCircle size={18} />, label: 'Aide & Contact', path: '/contact' },
                  ...(user
                    ? []
                    : [{ icon: <LogIn size={18} />, label: 'Se connecter', path: '/login' }]),
                ].map((item, i) => (
                  <motion.button
                    key={item.label}
                    custom={CATEGORIES.length + i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-500 w-7 flex-none flex items-center">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-800">{item.label}</span>
                    <ChevronRight size={16} className="text-gray-400 ml-auto" />
                  </motion.button>
                ))}
              </div>

              {/* Bottom padding for safe area */}
              <div className="h-8" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
