'use client';

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, Storefront } from '@phosphor-icons/react';
import { trpc } from '@/lib/trpc';

const BG    = '#FFFFFF';
const WHITE = '#FFFFFF';
const BLUE  = '#E8192C';
const NAVY  = '#1A1A1A';
const TEXT  = '#1D1D1D';
const MUTED = '#666666';
const GREEN = '#00A651';
const RED   = '#C0392B';
const AMBER = '#E67E22';
const BORDER = '#E5E5E5';
const SHADOW = '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)';

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  new:             { label: 'كومندة وصلت',     color: '#E8192C',  step: 0 },
  processing:      { label: 'قيد الشراء',       color: AMBER, step: 1 },
  waiting_payment: { label: 'ينتظر الدفع',      color: AMBER, step: 1 },
  shipped:         { label: 'في الشحن',         color: '#E8192C',  step: 2 },
  arrived:         { label: 'وصلت تونس',        color: GREEN, step: 3 },
  completed:       { label: 'تسلّمت',           color: GREEN, step: 4 },
  cancelled:       { label: 'ملغية',            color: RED,   step: -1 },
};

const TIMELINE_STEPS = [
  { key: 'new',        label: 'وصلت',     Icon: Package },
  { key: 'processing', label: 'شراء',     Icon: Storefront },
  { key: 'shipped',    label: 'شحن',      Icon: Truck },
  { key: 'arrived',    label: 'تونس',     Icon: Package },
  { key: 'completed',  label: 'تسلّمت',   Icon: CheckCircle },
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

  const { data: order, isLoading } = trpc.orders.getByTrackingCode.useQuery(
    { trackingCode: searchCode },
    { enabled: searchCode.length >= 8 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputCode.trim().toUpperCase();
    if (trimmed.length >= 4) setSearchCode(trimmed);
  };

  const currentConfig = order?.status ? STATUS_CONFIG[order.status] : null;
  const currentStep = currentConfig?.step ?? -1;

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('ar-TN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-md mx-auto px-4 pt-6 pb-28">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: WHITE, border: `1px solid ${BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: TEXT, cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
          >
            <ArrowLeft size={18} weight="bold" />
          </motion.button>
          <div dir="rtl">
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>
              تتبع كومندتك
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#666666' }}>
              حط كودك باش تشوف حالة كومندتك
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
            background: WHITE, borderRadius: 20, padding: '20px',
            boxShadow: SHADOW, border: `1px solid ${BORDER}`, marginBottom: 20,
          }}
          dir="rtl"
        >
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#666666', display: 'block', marginBottom: 10, letterSpacing: '0.04em' }}>
            كود التتبع
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              placeholder="BSS-XXXXXXXX"
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 12,
                border: `1.5px solid ${BORDER}`, fontSize: '1rem',
                fontWeight: 700, color: TEXT, background: '#FFFFFF',
                letterSpacing: '0.06em', outline: 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 18px', borderRadius: 12, background: BLUE,
                color: WHITE, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: 700, fontSize: '0.9rem',
                boxShadow: '0 2px 8px rgba(232,25,44,0.3)',
              }}
            >
              <MagnifyingGlass size={18} weight="bold" />
              ابحث
            </motion.button>
          </div>
        </motion.form>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading && searchCode && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '40px 0', color: '#666666' }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `3px solid ${BLUE}30`, borderTopColor: BLUE,
                animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
              }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>جاري البحث...</p>
            </motion.div>
          )}

          {!isLoading && searchCode && order === null && (
            <motion.div key="notfound" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: WHITE, borderRadius: 20, padding: '28px 20px', boxShadow: SHADOW, border: `1px solid ${BORDER}`, textAlign: 'center' }}
              dir="rtl"
            >
              <XCircle size={44} weight="fill" style={{ color: RED, marginBottom: 12 }} />
              <p style={{ fontWeight: 800, fontSize: '1.1rem', color: TEXT, marginBottom: 6 }}>ما لقيناش كومندة</p>
              <p style={{ color: '#666666', fontSize: '0.875rem', lineHeight: 1.6 }}>
                تأكد من الكود وعاود المحاولة.<br />
                الكود يكون بهذا الشكل: <strong style={{ color: '#1A1A1A' }}>BSS-XXXXXXXX</strong>
              </p>
            </motion.div>
          )}

          {!isLoading && order && currentConfig && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Status card */}
              <div style={{ background: WHITE, borderRadius: 20, padding: '20px', boxShadow: SHADOW, border: `1px solid ${BORDER}` }} dir="rtl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E8192C', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {order.trackingCode}
                    </p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: TEXT }}>{order.customerName}</p>
                    {order.gouvernorat && <p style={{ fontSize: '0.8125rem', color: '#666666' }}>{order.gouvernorat}</p>}
                  </div>
                  <div style={{
                    padding: '8px 14px', borderRadius: 999,
                    background: `${currentConfig.color}18`, color: currentConfig.color,
                    fontWeight: 700, fontSize: '0.875rem',
                    border: `1.5px solid ${currentConfig.color}40`,
                  }}>
                    {currentConfig.label}
                  </div>
                </div>

                {/* Timeline */}
                {order.status !== 'cancelled' && (
                  <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                    {TIMELINE_STEPS.map(({ key, label, Icon }, i) => {
                      const done = currentStep >= i;
                      const active = currentStep === i;
                      return (
                        <div key={key} className="flex flex-col items-center" style={{ flex: 1 }}>
                          <div className="flex items-center w-full">
                            {i > 0 && <div style={{ flex: 1, height: 2, background: currentStep >= i ? BLUE : '#E0E6ED', transition: 'background 0.3s' }} />}
                            <div style={{
                              width: active ? 32 : 26, height: active ? 32 : 26, borderRadius: '50%',
                              background: done ? (active ? BLUE : `${BLUE}20`) : '#E0E6ED',
                              border: `2px solid ${done ? BLUE : '#E5E5E5'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: done ? (active ? WHITE : BLUE) : '#9DA3A6',
                              flexShrink: 0, transition: 'all 0.3s',
                              boxShadow: active ? `0 0 0 4px ${BLUE}20` : 'none',
                            }}>
                              <Icon size={14} weight="fill" />
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: currentStep > i ? BLUE : '#E0E6ED', transition: 'background 0.3s' }} />}
                          </div>
                          <p style={{ fontSize: '0.6rem', fontWeight: active ? 700 : 500, color: done ? (active ? NAVY : BLUE) : '#9DA3A6', marginTop: 4, textAlign: 'center' }}>
                            {label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details card */}
              <div style={{ background: WHITE, borderRadius: 20, padding: '20px', boxShadow: SHADOW, border: `1px solid ${BORDER}` }} dir="rtl">
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E8192C', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                  تفاصيل الكومندة
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.875rem', color: '#666666', fontWeight: 500 }}>تاريخ الطلب</span>
                    <span style={{ fontSize: '0.875rem', color: TEXT, fontWeight: 700 }}>{formatDate(order.createdAt)}</span>
                  </div>
                  <div style={{ height: 1, background: '#F0F4F8' }} />
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.875rem', color: '#666666', fontWeight: 500 }}>آخر تحديث</span>
                    <span style={{ fontSize: '0.875rem', color: TEXT, fontWeight: 700 }}>{formatDate(order.updatedAt)}</span>
                  </div>
                  {order.gouvernorat && (
                    <>
                      <div style={{ height: 1, background: '#F0F4F8' }} />
                      <div className="flex justify-between items-center">
                        <span style={{ fontSize: '0.875rem', color: '#666666', fontWeight: 500 }}>الولاية</span>
                        <span style={{ fontSize: '0.875rem', color: TEXT, fontWeight: 700 }}>{order.gouvernorat}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
