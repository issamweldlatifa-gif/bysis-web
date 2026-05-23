'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  Tag,
  ArrowSquareOut,
  Sparkle,
} from '@phosphor-icons/react';
import { useChatContext } from '@/App';

const PLATFORM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  shein:       { bg: 'bg-pink-500/20',   text: 'text-pink-400',   label: 'Shein' },
  aliexpress:  { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'AliExpress' },
  temu:        { bg: 'bg-blue-500/20',    text: 'text-blue-400',    label: 'Temu' },
};

// Real ArrivageItem type matching DB schema
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

export default function Arrivage() {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'shein' | 'aliexpress' | 'temu'>('all');
  const { openChat } = useChatContext();

  const { data, isLoading } = trpc.arrivage.list.useQuery();
  const items: ArrivageItem[] = (data as any[]) || [];

  const filtered = items.filter((item) => {
    if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
    return item.available !== 0;
  });

  return (
    <AppLayout onChatOpen={openChat}>
      <div className="p-4 space-y-5 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold" style={{ background: 'linear-gradient(90deg, #0070BA, #003087)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Boutique
          </h1>
          <p className="text-[#6C7378] text-sm">Produits disponibles à commander maintenant</p>
        </motion.div>

        {/* Platform Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'shein', 'aliexpress', 'temu'] as const).map((p) => (
            <motion.button
              key={p}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPlatformFilter(p)}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm transition-all ${
                platformFilter === p
                  ? 'text-white shadow-lg shadow-blue-500/30'
                  : 'bg-[#141520] text-[#6C7378] hover:bg-gray-200'
              }`}
              style={platformFilter === p ? { background: 'linear-gradient(90deg, #0070BA, #003087)' } : {}}
            >
              {p === 'all' ? 'Tous' : PLATFORM_COLORS[p].label}
            </motion.button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-3"
          >
            <Package size={52} className="mx-auto text-gray-300" />
            <p className="text-[#6C7378] text-lg">Aucun produit disponible pour le moment</p>
            <p className="text-[#9DA3A6] text-sm">Revenez bientôt pour les nouveaux arrivages</p>
          </motion.div>
        )}

        {/* Products Grid */}
        {!isLoading && filtered.length > 0 && (
          <AnimatePresence>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item, index) => {
                const platform = PLATFORM_COLORS[item.platform] || PLATFORM_COLORS.shein;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#FFFFFF] rounded-2xl overflow-hidden border border-white/10 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
                  >
                    {/* Image */}
                    <div className="relative h-36 bg-[#F5F7FA] overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <ShoppingBag size={36} className="text-gray-300" />
                        </div>
                      )}
                      {/* Platform badge */}
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${platform.bg} ${platform.text}`}>
                        {platform.label}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-2">
                      <p className="text-gray-800 text-sm font-semibold leading-tight line-clamp-2">
                        {item.name}
                      </p>

                      {item.description && (
                        <p className="text-[#6C7378] text-xs line-clamp-1">{item.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-400 font-bold text-base">{item.priceTnd} دينار</p>
                          {item.priceEur && (
                            <p className="text-[#9DA3A6] text-xs">{item.priceEur} EUR</p>
                          )}
                        </div>

                        {item.productLink ? (
                          <a
                            href={item.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/30 transition-all"
                            title="عرض المنتج"
                          >
                            <ArrowSquareOut size={16} />
                          </a>
                        ) : null}
                      </div>

                      {/* Order via chat */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={openChat}
                        className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1"
                        style={{ background: 'linear-gradient(90deg, #0070BA, #003087)' }}
                      >
                        <Sparkle size={12} weight="fill" />
                        Commander
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </AppLayout>
  );
}
