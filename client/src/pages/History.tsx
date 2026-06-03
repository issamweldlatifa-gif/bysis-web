'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/AppLayout';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Trash, Clock } from 'lucide-react';
import { useChatContext } from '@/App';

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

const FILTER_LABELS = { all: 'Tout', today: "Aujourd'hui", week: 'Cette semaine' };
const SORT_LABELS = { date: 'Date', price: 'Prix' };

export default function History() {
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const { openChat } = useChatContext();

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
      toast.error('Erreur lors de la suppression');
    },
    onSuccess: () => {
      toast.success('Supprimé de l\'historique');
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
      <div className="p-4 space-y-4 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 style={{
            fontFamily: '"Barlow Condensed", Poppins, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            color: '#0A0A0A',
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            Historique
          </h1>

          {/* Time filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'today', 'week'] as const).map((f) => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 36,
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease',
                  background: filter === f ? '#0A0A0A' : '#FFFFFF',
                  color: filter === f ? '#FFFFFF' : '#0A0A0A',
                  border: filter === f ? 'none' : '1.5px solid #E8E8E8',
                  boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                {FILTER_LABELS[f]}
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
                  padding: '8px 16px',
                  borderRadius: 36,
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  transition: 'all 0.18s ease',
                  background: sortBy === s ? 'rgba(10,10,10,0.08)' : '#FFFFFF',
                  color: sortBy === s ? '#0A0A0A' : '#AAAAAA',
                  border: sortBy === s ? '1.5px solid rgba(10,10,10,0.25)' : '1.5px solid #E8E8E8',
                }}
              >
                {SORT_LABELS[s]}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Loading */}
        {getHistory.isLoading && (
          <div className="flex justify-center py-12">
            <div style={{ width: 32, height: 32, border: '3px solid #E8E8E8', borderTopColor: '#0A0A0A', borderRadius: '50%' }} className="animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!getHistory.isLoading && sortedItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-3"
          >
            <Clock size={48} className="mx-auto" style={{ color: '#AAAAAA' }} strokeWidth={1.5} />
            <p style={{ color: '#888888', fontSize: '1rem', fontWeight: 600 }}>Aucun élément dans l'historique</p>
            <p style={{ color: '#AAAAAA', fontSize: '0.875rem' }}>Utilisez la calculatrice pour scanner des prix</p>
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
                    borderRadius: 16,
                    padding: '14px',
                    border: '1px solid #E8E8E8',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="flex gap-3">
                    {/* Product image */}
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#F5F5F5',
                      border: '1px solid #E8E8E8',
                    }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="Produit" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAAAAA', fontSize: '0.75rem' }}>
                          Pas d'image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#AAAAAA', fontWeight: 500, marginBottom: 2 }}>
                            {new Date(item.createdAt).toLocaleDateString('fr-TN')}
                          </p>
                          <p style={{
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            color: '#0A0A0A',
                            fontFamily: '"Barlow Condensed", Poppins, sans-serif',
                            letterSpacing: '-0.01em',
                          }}>
                            {parseFloat(item.priceTnd || '0').toFixed(2)} DT
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#888888', fontWeight: 600, marginTop: 2 }}>
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
                            borderRadius: 12,
                            background: 'rgba(220,38,38,0.08)',
                            color: '#DC2626',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease',
                            flexShrink: 0,
                          }}
                          title="Supprimer"
                        >
                          <Trash size={18} strokeWidth={1.5} />
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
