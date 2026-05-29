'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingBag, Tag, ExternalLink, Sparkle } from 'lucide-react';
import { useChatContext } from '@/App';
import { useCart } from '@/contexts/CartContext';
import { useI18n } from '@/contexts/I18nContext';
import { useBgColor } from '@/contexts/BgColorContext';
import { extractDominantColor } from '@/hooks/useImageColor';
import { toast } from 'sonner';

const PLATFORM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  shein:      { bg: 'bg-pink-500/20',  text: 'text-pink-400',  label: 'Shein' },
  aliexpress: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'AliExpress' },
  temu:       { bg: 'bg-blue-500/20',  text: 'text-blue-400',  label: 'Temu' },
};

// Demo images using the 4 uploaded colors
const DEMO_IMAGES = [
  '/manus-storage/product-green_84ad236a.png',
  '/manus-storage/product-teal_f635ee38.png',
  '/manus-storage/product-red_2d4c0132.png',
  '/manus-storage/product-navy_3320c587.png',
];

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

/** Card that uses IntersectionObserver to trigger color extraction when visible */
function ProductCard({
  item,
  index,
  onVisible,
  onAddToCart,
  t,
}: {
  item: ArrivageItem;
  index: number;
  onVisible: (imageUrl: string) => void;
  onAddToCart: (item: ArrivageItem) => void;
  t: (k: any) => string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const platform = PLATFORM_COLORS[item.platform] || PLATFORM_COLORS.shein;
  // Use demo image if no imageUrl, cycling through the 4 colors
  const displayImage = item.imageUrl || DEMO_IMAGES[index % DEMO_IMAGES.length];

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && displayImage) {
            onVisible(displayImage);
          }
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [displayImage, onVisible]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
      style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)' }}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden" style={{ background: 'rgba(255,255,255,0.4)' }}>
        <img
          src={displayImage}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          crossOrigin="anonymous"
        />
        {/* Platform badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${platform.bg} ${platform.text}`}>
          {platform.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-gray-800 text-sm font-semibold leading-tight line-clamp-2">{item.name}</p>
        {item.description && (
          <p className="text-gray-500 text-xs line-clamp-1">{item.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-900 font-bold text-base">{item.priceTnd} دينار</p>
            {item.priceEur && (
              <p className="text-gray-400 text-xs">{item.priceEur} EUR</p>
            )}
          </div>
          {item.productLink && (
            <a
              href={item.productLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-black/10 text-gray-600 hover:bg-black/20 transition-all"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Add to cart */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onAddToCart(item)}
          className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        >
          <Sparkle size={12} />
          {t('add_to_cart')}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Arrivage() {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'shein' | 'aliexpress' | 'temu'>('all');
  const { openChat } = useChatContext();
  const { addItem } = useCart();
  const { t } = useI18n();
  const { setBgColor } = useBgColor();
  const { data, isLoading } = trpc.arrivage.list.useQuery();
  const items: ArrivageItem[] = (data as any[]) || [];
  const filtered = items.filter((item) => {
    if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
    return item.available !== 0;
  });

  // Color extraction: debounced to avoid rapid changes
  const colorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleImageVisible = useCallback((imageUrl: string) => {
    if (colorTimerRef.current) clearTimeout(colorTimerRef.current);
    colorTimerRef.current = setTimeout(async () => {
      const color = await extractDominantColor(imageUrl);
      setBgColor(color);
    }, 120);
  }, [setBgColor]);

  // Reset bg when leaving
  useEffect(() => {
    return () => {
      if (colorTimerRef.current) clearTimeout(colorTimerRef.current);
      setBgColor('#cadfe2');
    };
  }, [setBgColor]);

  const handleAddToCart = useCallback((item: ArrivageItem) => {
    addItem({
      id: String(item.id),
      name: item.name,
      priceTnd: item.priceTnd,
      imageUrl: item.imageUrl || undefined,
      productLink: item.productLink || undefined,
      platform: item.platform,
    });
    toast.success(t('add_to_cart') + ' ✓', { duration: 1800 });
  }, [addItem, t]);

  return (
    <AppLayout onChatOpen={openChat}>
      <div className="p-4 space-y-5 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold text-gray-900">Boutique</h1>
          <p className="text-gray-500 text-sm">Produits disponibles à commander maintenant</p>
        </motion.div>

        {/* Platform Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', 'shein', 'aliexpress', 'temu'] as const).map((p) => (
            <motion.button
              key={p}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPlatformFilter(p)}
              className="px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm transition-all"
              style={{
                background: platformFilter === p ? 'rgba(0,0,0,0.80)' : 'rgba(255,255,255,0.70)',
                color: platformFilter === p ? '#fff' : '#374151',
                backdropFilter: 'blur(8px)',
                border: platformFilter === p ? 'none' : '1px solid rgba(0,0,0,0.10)',
              }}
            >
              {p === 'all' ? 'Tous' : p.charAt(0).toUpperCase() + p.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', height: '260px' }}>
                <div className="shimmer h-40 w-full" />
                <div className="p-3 space-y-2">
                  <div className="shimmer h-4 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-3"
          >
            <Package size={52} className="mx-auto text-gray-300" />
            <p className="text-gray-400 text-lg">Aucun produit disponible</p>
            <p className="text-gray-400 text-sm">Revenez bientôt pour les nouveaux arrivages</p>
          </motion.div>
        )}

        {/* Products Grid */}
        {!isLoading && filtered.length > 0 && (
          <AnimatePresence>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item, index) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  index={index}
                  onVisible={handleImageVisible}
                  onAddToCart={handleAddToCart}
                  t={t}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </AppLayout>
  );
}
