import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingCart, ExternalLink, Star, ChevronDown, SlidersHorizontal } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { trpc } from '@/lib/trpc';
import { useChatContext } from '@/App';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

type ArrivageItem = {
  id: number;
  name: string;
  description: string | null;
  priceTnd: number;
  priceEur: number | null;
  imageUrl: string | null;
  platform: 'shein' | 'aliexpress' | 'temu';
  available: number;
  productLink: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  shein:      { label: 'Shein',      color: '#E8192C' },
  aliexpress: { label: 'AliExpress', color: '#FF6A00' },
  temu:       { label: 'Temu',       color: '#FF4B00' },
};

function StarRow({ rating = 4.2, count = 0 }: { rating?: number; count?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i < Math.floor(rating) ? '#FF9900' : '#D5D9D9'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {count > 0 && <span className="text-[11px] ml-0.5" style={{ color: '#007185' }}>{count}</span>}
    </span>
  );
}

export default function Arrivage() {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'shein' | 'aliexpress' | 'temu'>('all');
  const { openChat } = useChatContext();
  const { addItem } = useCart();
  const { data, isLoading } = trpc.arrivage.list.useQuery();
  const items: ArrivageItem[] = (data as any[]) || [];
  const filtered = items.filter((item) => {
    if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
    return item.available !== 0;
  });

  return (
    <AppLayout onChatOpen={openChat}>
      <div style={{ background: '#F3F3F3', minHeight: '100vh' }}>

        {/* ── Page Header ── */}
        <div className="bg-white px-3 py-3" style={{ borderBottom: '1px solid #EAEDED' }}>
          <h1 className="text-base font-bold mb-1" style={{ color: '#0F1111' }}>
            Boutiques Bysis
          </h1>
          <p className="text-xs" style={{ color: '#565959' }}>
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide" style={{ borderBottom: '1px solid #EAEDED' }}>
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
            style={{ background: '#F3F3F3', border: '1px solid #D5D9D9', color: '#0F1111' }}
          >
            <SlidersHorizontal size={12} strokeWidth={2} />
            Filtres
          </button>
          {(['all', 'shein', 'aliexpress', 'temu'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all"
              style={{
                background: platformFilter === p ? '#131921' : '#F3F3F3',
                color: platformFilter === p ? '#FFFFFF' : '#0F1111',
                border: `1px solid ${platformFilter === p ? '#131921' : '#D5D9D9'}`,
              }}
            >
              {p === 'all' ? 'Tout' : PLATFORM_LABELS[p]?.label}
            </button>
          ))}
          <div className="flex-shrink-0 flex items-center gap-1 ml-auto px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#F3F3F3', border: '1px solid #D5D9D9', color: '#0F1111' }}>
            Trier <ChevronDown size={11} strokeWidth={2.5} />
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-px mt-px" style={{ background: '#EAEDED' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-3">
                <div className="shimmer rounded mb-2" style={{ height: '140px' }} />
                <div className="shimmer rounded mb-1" style={{ height: '12px', width: '80%' }} />
                <div className="shimmer rounded mb-2" style={{ height: '12px', width: '60%' }} />
                <div className="shimmer rounded" style={{ height: '32px' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Package size={48} color="#D5D9D9" className="mb-3" />
            <p className="text-sm font-semibold mb-1" style={{ color: '#0F1111' }}>Aucun produit disponible</p>
            <p className="text-xs" style={{ color: '#565959' }}>Revenez bientôt pour les nouveaux arrivages</p>
          </div>
        )}

        {/* ── Products Grid ── */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-px mt-px" style={{ background: '#EAEDED' }}>
            <AnimatePresence>
              {filtered.map((item, index) => {
                const plat = PLATFORM_LABELS[item.platform] || PLATFORM_LABELS.shein;
                const fakeRating = 3.8 + (item.id % 12) * 0.1;
                const fakeCount = 50 + (item.id * 37) % 800;
                const discount = item.priceEur
                  ? Math.max(0, Math.round((1 - item.priceTnd / (item.priceEur * 3.4)) * 100))
                  : (item.id % 3 === 0 ? 15 : item.id % 3 === 1 ? 8 : 0);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white p-3 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative mb-2" style={{ height: '150px', background: '#F8F8F8', borderRadius: '2px' }}>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={36} color="#D5D9D9" />
                        </div>
                      )}
                      {/* Discount badge */}
                      {discount > 0 && (
                        <span
                          className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
                          style={{ background: '#CC0C39', color: '#FFFFFF' }}
                        >
                          -{discount}%
                        </span>
                      )}
                      {/* Platform badge */}
                      <span
                        className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-sm"
                        style={{ background: plat.color, color: '#FFFFFF' }}
                      >
                        {plat.label}
                      </span>
                    </div>

                    {/* Name */}
                    <p className="text-xs font-medium line-clamp-2 mb-1.5 flex-1" style={{ color: '#0F1111' }}>
                      {item.name}
                    </p>

                    {/* Stars */}
                    <StarRow rating={fakeRating} count={fakeCount} />

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mt-1 mb-0.5">
                      <span className="text-sm font-bold" style={{ color: '#B12704' }}>
                        {item.priceTnd.toFixed(2)} TND
                      </span>
                      {item.priceEur && (
                        <span className="text-[10px]" style={{ color: '#565959', textDecoration: 'line-through' }}>
                          {(item.priceEur * 3.4 * 1.15).toFixed(0)} TND
                        </span>
                      )}
                    </div>

                    {/* Delivery */}
                    <p className="text-[10px] mb-2" style={{ color: '#007600', fontWeight: 600 }}>
                      Livraison GRATUITE
                    </p>

                    {/* Add to cart button */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        addItem({
                          id: String(item.id),
                          name: item.name,
                          priceTnd: item.priceTnd,
                          imageUrl: item.imageUrl || undefined,
                          productLink: item.productLink || undefined,
                          platform: item.platform,
                        });
                        toast.success('Ajouté au panier ✓', { duration: 1800 });
                      }}
                      className="w-full py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: 'linear-gradient(to bottom, #FFE082, #FFD814)',
                        border: '1px solid #C8A600',
                        color: '#0F1111',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                      }}
                    >
                      <ShoppingCart size={12} strokeWidth={2.5} />
                      Ajouter au panier
                    </motion.button>

                    {/* External link */}
                    {item.productLink && (
                      <a
                        href={item.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 mt-1.5 text-[10px] font-semibold"
                        style={{ color: '#007185' }}
                      >
                        <ExternalLink size={10} strokeWidth={2} />
                        Voir sur {plat.label}
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <div style={{ height: '16px' }} />
      </div>
    </AppLayout>
  );
}
