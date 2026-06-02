'use client';

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/AppLayout';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Trash, Clock } from 'lucide-react';
import { useChatContext } from '@/App';

// Stable device ID — one per browser, never shared between users
function getDeviceId(): string {
  const KEY = 'bysis_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

interface HistoryItem {
  id: number;
  originalPrice: string;
  originalCurrency: string;
  priceEur: string;
  priceTnd: string;
  imageUrl: string;
  createdAt: Date;
}

export default function History() {
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const { openChat } = useChatContext();

  // Stable deviceId reference — never recreated on re-render
  const deviceId = useMemo(() => getDeviceId(), []);

  const utils = trpc.useUtils();
  const getHistory = trpc.calculator.getHistory.useQuery({ deviceId });
  const deleteHistoryMutation = trpc.calculator.deleteHistory.useMutation({
    onMutate: async ({ id }) => {
      await utils.calculator.getHistory.cancel();
      const prev = utils.calculator.getHistory.getData({ deviceId });
      utils.calculator.getHistory.setData({ deviceId }, (old) =>
        (old || []).filter((item: any) => item.id !== id)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.calculator.getHistory.setData({ deviceId }, ctx.prev);
      toast.error('فشل الحذف — حاول مرة أخرى');
    },
    onSuccess: () => {
      toast.success('تم حذف من السجل');
    },
    onSettled: () => {
      utils.calculator.getHistory.invalidate({ deviceId });
    },
  });

  const items: HistoryItem[] = (getHistory.data as any[]) || [];

  const filteredItems = items.filter((item) => {
    const itemDate = new Date(item.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
    if (filter === 'today') return daysDiff < 1;
    if (filter === 'week') return daysDiff < 7;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price') {
      return parseFloat(b.priceTnd || '0') - parseFloat(a.priceTnd || '0');
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleDelete = (id: number) => {
    deleteHistoryMutation.mutate({ id, deviceId });
  };

  return (
    <AppLayout onChatOpen={openChat}>
      <div className="p-4 space-y-4 pb-24" dir="rtl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#1A1A1A', letterSpacing: '-0.03em' }}>
            السجل
          </h1>

          {/* Time filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'today', 'week'] as const).map((f) => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease',
                  background: filter === f ? '#1A1A1A' : '#FFFFFF',
                  color: filter === f ? '#FFFFFF' : '#1A1A1A',
                  border: filter === f ? 'none' : '1.5px solid #D0D7DE',
                  boxShadow: filter === f ? '0 2px 8px rgba(26,26,26,0.25)' : 'none',
                }}
              >
                {f === 'all' ? 'الكل' : f === 'today' ? 'اليوم' : 'هذا الأسبوع'}
              </motion.button>
            ))}
          </div>

          {/* Sort filters */}
          <div className="flex gap-2">
            {(['date', 'price'] as const).map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy(s)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  transition: 'all 0.18s ease',
                  background: sortBy === s ? 'rgba(26,26,26,0.1)' : '#FFFFFF',
                  color: sortBy === s ? '#1A1A1A' : '#999999',
                  border: sortBy === s ? '1.5px solid rgba(26,26,26,0.35)' : '1.5px solid #D0D7DE',
                }}
              >
                {s === 'date' ? 'التاريخ' : 'السعر'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Loading — Skeleton Screens */}
        {getHistory.isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '14px', border: '1px solid #E8ECF0' }}>
                <div className="flex gap-3">
                  <div style={{ width: 72, height: 72, borderRadius: '12px', background: '#F0F0F0' }} className="animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                    <div className="h-5 bg-gray-100 rounded animate-pulse w-1/2" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!getHistory.isLoading && sortedItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-3"
          >
            <Clock size={48} className="mx-auto" style={{ color: '#9DA3A6' }} />
            <p style={{ color: '#999999', fontSize: '1rem', fontWeight: 600 }}>لا توجد عناصر في السجل</p>
            <p style={{ color: '#9DA3A6', fontSize: '0.875rem' }}>استخدم الحاسبة لمسح أسعار المنتجات</p>
          </motion.div>
        )}

        {/* History List */}
        {sortedItems.length > 0 && (
          <AnimatePresence>
            <div className="space-y-3">
              {sortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: index * 0.04, duration: 0.22 }}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '14px',
                    border: '1px solid #E8ECF0',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex gap-3">
                    {/* Product image */}
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#FFFFFF',
                      border: '1px solid #D0D7DE',
                    }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" decoding="async" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9DA3A6', fontSize: '0.75rem' }}>
                          لا صورة
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#9DA3A6', fontWeight: 500, marginBottom: 2 }}>
                            {new Date(item.createdAt).toLocaleDateString('ar-TN')}
                          </p>
                          <p style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif" }}>
                            {parseFloat(item.priceTnd || '0').toFixed(2)} دينار
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#1A1A1A', fontWeight: 600, marginTop: 2 }}>
                            {item.originalPrice} {item.originalCurrency}
                            {item.priceEur && parseFloat(item.priceEur) > 0 ? ` • ${parseFloat(item.priceEur).toFixed(2)} EUR` : ''}
                          </p>
                        </div>

                        {/* Delete action */}
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteHistoryMutation.isPending}
                          style={{
                            padding: '8px',
                            borderRadius: '10px',
                            background: 'rgba(220,38,38,0.08)',
                            color: '#DC2626',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease',
                            flexShrink: 0,
                          }}
                          title="حذف"
                        >
                          <Trash size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </AppLayout>
  );
}
