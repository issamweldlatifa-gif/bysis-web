'use client';

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, Store } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  new:             { label: 'Commande reçue',    color: '#0A0A0A', step: 0 },
  processing:      { label: 'En traitement',     color: '#E67E22', step: 1 },
  waiting_payment: { label: 'Paiement attendu',  color: '#E67E22', step: 1 },
  shipped:         { label: 'En livraison',       color: '#0A0A0A', step: 2 },
  arrived:         { label: 'Arrivée en Tunisie', color: '#00A651', step: 3 },
  completed:       { label: 'Livré',             color: '#00A651', step: 4 },
  cancelled:       { label: 'Annulée',           color: '#C0392B', step: -1 },
};

const TIMELINE_STEPS = [
  { key: 'new',        label: 'Reçue',    Icon: Package },
  { key: 'processing', label: 'Achat',    Icon: Store },
  { key: 'shipped',    label: 'Expédié',  Icon: Truck },
  { key: 'arrived',    label: 'Tunisie',  Icon: Package },
  { key: 'completed',  label: 'Livré',    Icon: CheckCircle },
];

export default function TrackOrder() {
  const [, navigate] = useLocation();
  const [inputCode, setInputCode] = useState('');
  const [searchCode, setSearchCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setInputCode(code);
      setSearchCode(code.toUpperCase());
    }
  }, []);

  const isAiCode = searchCode.startsWith('BY');

  const { data: regularOrder, isLoading: regularLoading } = trpc.orders.getByTrackingCode.useQuery(
    { trackingCode: searchCode },
    { enabled: searchCode.length >= 4 && !isAiCode }
  );

  const { data: aiOrder, isLoading: aiLoading } = trpc.aiOrders.track.useQuery(
    { trackingCode: searchCode },
    { enabled: searchCode.length >= 4 && isAiCode, retry: false }
  );

  const order = isAiCode ? aiOrder : regularOrder;
  const isLoading = isAiCode ? aiLoading : regularLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputCode.trim().toUpperCase();
    if (trimmed.length >= 4) setSearchCode(trimmed);
  };

  const normalizedOrder = order && isAiCode ? {
    ...order,
    customerName: `${(order as any).customerName || ''} ${(order as any).customerLastName || ''}`.trim(),
    customerPhone: (order as any).phone || (order as any).customerPhone || '',
    customerAddress: (order as any).gouvernorat || '',
    gouvernorat: (order as any).gouvernorat || '',
    productUrl: (order as any).productUrl || '',
    screenshotUrl: (order as any).productImageUrl || null,
    updatedAt: (order as any).updatedAt || (order as any).createdAt,
    status: (() => {
      const s = (order as any).status || '';
      if (s === 'pending_deposit' || s === 'pending') return 'new';
      if (s === 'deposit_received' || s === 'confirmed') return 'processing';
      if (s === 'processing') return 'processing';
      if (s === 'shipped') return 'shipped';
      if (s === 'delivered') return 'completed';
      if (s === 'cancelled') return 'cancelled';
      return s;
    })(),
  } : order;

  const currentConfig = normalizedOrder?.status ? STATUS_CONFIG[normalizedOrder.status] : null;
  const currentStep = currentConfig?.step ?? -1;

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF', fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-md mx-auto px-4 pt-6 pb-28">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#FFFFFF', border: '1.5px solid #E8E8E8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0A0A0A', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </motion.button>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 7vw, 2.5rem)',
              fontWeight: 900,
              color: '#0A0A0A',
              fontFamily: '"Barlow Condensed", Poppins, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}>
              Suivi Commande
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#888888', marginTop: 2 }}>
              Entrez votre code de suivi
            </p>
          </div>
        </div>

        {/* Search form */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: '#FFFFFF', borderRadius: 20, padding: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E8E8E8', marginBottom: 20,
          }}
        >
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888888', display: 'block', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Code de suivi
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              placeholder="BSS-XXXXXXXX ou BY..."
              style={{
                flex: 1, padding: '14px 16px', borderRadius: 36,
                border: '1.5px solid #E8E8E8', fontSize: '0.9375rem',
                fontWeight: 700, color: '#0A0A0A', background: '#FFFFFF',
                letterSpacing: '0.04em', outline: 'none',
                fontFamily: "'Poppins', sans-serif",
              }}
              onFocus={e => (e.target.style.borderColor = '#0A0A0A')}
              onBlur={e => (e.target.style.borderColor = '#E8E8E8')}
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '14px 20px', borderRadius: 36, background: '#0A0A0A',
                color: '#FFFFFF', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: 700, fontSize: '0.875rem',
              }}
            >
              <Search size={16} strokeWidth={1.5} />
              Chercher
            </motion.button>
          </div>
        </motion.form>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading && searchCode && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '40px 0', color: '#888888' }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid #E8E8E8', borderTopColor: '#0A0A0A',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
              }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Recherche en cours...</p>
            </motion.div>
          )}

          {!isLoading && searchCode && !normalizedOrder && (
            <motion.div key="notfound" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: '#FFFFFF', borderRadius: 20, padding: '28px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E8E8E8', textAlign: 'center' }}
            >
              <XCircle size={44} style={{ color: '#C0392B', marginBottom: 12, margin: '0 auto 12px' }} strokeWidth={1.5} />
              <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0A0A0A', marginBottom: 6 }}>Commande introuvable</p>
              <p style={{ color: '#888888', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Vérifiez votre code et réessayez.<br />
                Format : <strong style={{ color: '#0A0A0A' }}>BSS-XXXXXXXX</strong> ou <strong style={{ color: '#0A0A0A' }}>BYXXXXXXXX</strong>
              </p>
            </motion.div>
          )}

          {!isLoading && normalizedOrder && currentConfig && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Status card */}
              <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E8E8E8' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#888888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {normalizedOrder.trackingCode}
                    </p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A0A0A', fontFamily: '"Barlow Condensed", Poppins, sans-serif', textTransform: 'uppercase' }}>
                      {normalizedOrder.customerName}
                    </p>
                    {normalizedOrder.gouvernorat && <p style={{ fontSize: '0.8125rem', color: '#888888' }}>{normalizedOrder.gouvernorat}</p>}
                  </div>
                  <div style={{
                    padding: '8px 16px', borderRadius: 999,
                    background: `${currentConfig.color}15`, color: currentConfig.color,
                    fontWeight: 700, fontSize: '0.8125rem',
                    border: `1.5px solid ${currentConfig.color}30`,
                  }}>
                    {currentConfig.label}
                  </div>
                </div>

                {/* Timeline */}
                {normalizedOrder.status !== 'cancelled' && (
                  <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                    {TIMELINE_STEPS.map(({ key, label, Icon }, i) => {
                      const done = currentStep >= i;
                      const active = currentStep === i;
                      return (
                        <div key={key} className="flex flex-col items-center" style={{ flex: 1 }}>
                          <div className="flex items-center w-full">
                            {i > 0 && <div style={{ flex: 1, height: 2, background: currentStep >= i ? '#0A0A0A' : '#E8E8E8', transition: 'background 0.3s' }} />}
                            <div style={{
                              width: active ? 32 : 26, height: active ? 32 : 26, borderRadius: '50%',
                              background: done ? (active ? '#0A0A0A' : '#F0F0F0') : '#F0F0F0',
                              border: `2px solid ${done ? '#0A0A0A' : '#E8E8E8'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: done ? (active ? '#FFFFFF' : '#0A0A0A') : '#AAAAAA',
                              flexShrink: 0, transition: 'all 0.3s',
                              boxShadow: active ? '0 0 0 4px rgba(10,10,10,0.12)' : 'none',
                            }}>
                              <Icon size={13} strokeWidth={1.5} />
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: currentStep > i ? '#0A0A0A' : '#E8E8E8', transition: 'background 0.3s' }} />}
                          </div>
                          <p style={{ fontSize: '0.6rem', fontWeight: active ? 700 : 500, color: done ? '#0A0A0A' : '#AAAAAA', marginTop: 4, textAlign: 'center' }}>
                            {label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details card */}
              <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E8E8E8' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#888888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Détails de la commande
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.875rem', color: '#888888', fontWeight: 500 }}>Date de commande</span>
                    <span style={{ fontSize: '0.875rem', color: '#0A0A0A', fontWeight: 700 }}>{formatDate(normalizedOrder.createdAt)}</span>
                  </div>
                  <div style={{ height: 1, background: '#F5F5F5' }} />
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.875rem', color: '#888888', fontWeight: 500 }}>Dernière mise à jour</span>
                    <span style={{ fontSize: '0.875rem', color: '#0A0A0A', fontWeight: 700 }}>{formatDate(normalizedOrder.updatedAt)}</span>
                  </div>
                  {normalizedOrder.gouvernorat && (
                    <>
                      <div style={{ height: 1, background: '#F5F5F5' }} />
                      <div className="flex justify-between items-center">
                        <span style={{ fontSize: '0.875rem', color: '#888888', fontWeight: 500 }}>Gouvernorat</span>
                        <span style={{ fontSize: '0.875rem', color: '#0A0A0A', fontWeight: 700 }}>{normalizedOrder.gouvernorat}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate('/')}
                className="btn-nike-full"
              >
                Retour à l'accueil
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
