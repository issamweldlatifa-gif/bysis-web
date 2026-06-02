'use client';

import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/AppLayout';

const BLUE = '#1A1A1A';

function EmptyCart({ t, isDark }: { t: (k: any) => string; isDark: boolean }) {
  const [, navigate] = useLocation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: isDark ? 'rgba(26,26,26,0.15)' : '#F5F5F5' }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
        </svg>
      </motion.div>
      <h2 className="text-xl font-bold mb-2" style={{ color: isDark ? '#fff' : '#1C1C1E' }}>{t('cart_empty')}</h2>
      <p className="text-sm mb-8" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#999999' }}>
        Parcourez nos boutiques et ajoutez des produits à votre panier
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/catalogue')}
        className="px-8 py-3.5 rounded-2xl text-sm font-bold text-white"
        style={{ background: `linear-gradient(135deg, ${BLUE}, #1A1A1A)` }}
      >
        Voir les boutiques
      </motion.button>
    </div>
  );
}

export default function Panier() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { t } = useI18n();
  const { theme } = useTheme();
  const [, navigate] = useLocation();
  const isDark = theme === 'dark';

  const bg = isDark ? '#0D0D0F' : '#FFFFFF';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#1C1C1E';
  const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : '#999999';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const handleCommander = () => {
    if (items.length === 0) return;
    // Store all cart items in sessionStorage for OrderForm
    sessionStorage.setItem('bysis_cart_order', JSON.stringify(items));
    const first = items[0];
    const params = new URLSearchParams({
      productLink: first.productLink || '',
      quantity: String(first.quantity),
      productName: items.length > 1 ? `${items.length} articles (${totalPrice.toFixed(2)} DT)` : first.name,
      fromCart: '1',
    });
    navigate(`/order?${params.toString()}`);
  };

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-6" style={{ background: bg, minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black" style={{ color: textPrimary }}>{t('cart_title')}</h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl"
              style={{ color: '#EF4444', background: '#FEF2F2' }}
            >
              Vider
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyCart t={t} isDark={isDark} />
        ) : (
          <>
            {/* Items */}
            <div className="space-y-3 mb-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -60, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="rounded-2xl p-4 flex gap-3"
                    style={{ background: cardBg, border: `1px solid ${border}` }}
                  >
                    {/* Image */}
                    <div
                      className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden"
                      style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F7' }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" width={64} height={64} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate mb-0.5" style={{ color: textPrimary }}>{item.name}</p>
                      {item.platform && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: isDark ? 'rgba(26,26,26,0.2)' : '#F5F5F5', color: '#1A1A1A' }}
                        >
                          {item.platform}
                        </span>
                      )}
                      <p className="text-base font-black mt-1" style={{ color: '#1A1A1A' }}>
                        {(item.priceTnd * item.quantity).toFixed(2)} DT
                      </p>
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex flex-col items-end justify-between gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: '#FEF2F2', color: '#EF4444' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>

                      <div
                        className="flex items-center gap-2 rounded-xl px-2 py-1"
                        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F5F5F7' }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-base"
                          style={{ color: textPrimary }}
                        >
                          −
                        </button>
                        <span className="text-sm font-bold w-5 text-center" style={{ color: textPrimary }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-base"
                          style={{ color: '#1A1A1A' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background: cardBg, border: `1px solid ${border}` }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: textSecondary }}>Articles ({totalItems})</span>
                <span className="text-sm font-semibold" style={{ color: textPrimary }}>{totalPrice.toFixed(2)} DT</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: textSecondary }}>Livraison</span>
                <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>Incluse</span>
              </div>
              <div style={{ height: 1, background: border, margin: '12px 0' }} />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold" style={{ color: textPrimary }}>{t('cart_total')}</span>
                <span className="text-xl font-black" style={{ color: '#1A1A1A' }}>{totalPrice.toFixed(2)} DT</span>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCommander}
              className="w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${BLUE}, #1A1A1A)`, boxShadow: '0 4px 16px rgba(26,26,26,0.35)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              {t('cart_checkout')}
            </motion.button>

            <p className="text-center text-xs mt-3" style={{ color: textSecondary }}>
              Vous serez redirigé vers le formulaire de commande
            </p>
          </>
        )}
      </div>
    </AppLayout>
  );
}
