'use client';

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, MagnifyingGlass, House, WhatsappLogo } from '@phosphor-icons/react';
import { toast } from 'sonner';

const BG    = '#EEF2F7';
const WHITE = '#FFFFFF';
const BLUE  = '#0070BA';
const NAVY  = '#003087';
const TEXT  = '#1D1D1D';
const MUTED = '#4A4F54';
const GREEN = '#00A651';
const BORDER = '#CBD2D9';
const SHADOW = '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)';

interface ConfirmationData {
  trackingCode: string;
  customerName: string;
  orderId?: number;
}

export default function OrderConfirmation() {
  const [, navigate] = useLocation();
  const [data, setData] = useState<ConfirmationData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Read confirmation data from sessionStorage (set by OrderForm on success)
    const raw = sessionStorage.getItem('bysis_order_confirmation');
    if (raw) {
      try {
        setData(JSON.parse(raw));
        sessionStorage.removeItem('bysis_order_confirmation');
      } catch {
        navigate('/commande');
      }
    } else {
      navigate('/commande');
    }
  }, [navigate]);

  const copyCode = () => {
    if (!data?.trackingCode) return;
    navigator.clipboard.writeText(data.trackingCode).then(() => {
      setCopied(true);
      toast.success('Code copié !');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!data) return null;

  const statusSteps = [
    { key: 'received',  label: 'كومندة وصلت',     done: true  },
    { key: 'purchase',  label: 'قيد الشراء',       done: false },
    { key: 'shipping',  label: 'في الشحن',         done: false },
    { key: 'arrived',   label: 'وصلت تونس',        done: false },
    { key: 'delivered', label: 'تسلّمت',           done: false },
  ];

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-md mx-auto px-4 pt-10 pb-24">

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `${GREEN}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${GREEN}40`,
          }}>
            <CheckCircle size={44} weight="fill" style={{ color: GREEN }} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
          dir="rtl"
        >
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', marginBottom: 8 }}>
            كومندتك وصلت! 🎉
          </h1>
          <p style={{ color: MUTED, fontSize: '0.9375rem', lineHeight: 1.6 }}>
            مرحبا <strong style={{ color: TEXT }}>{data.customerName}</strong>،<br />
            سنتواصل معك قريباً لتأكيد التفاصيل.
          </p>
        </motion.div>

        {/* Tracking code card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: WHITE,
            borderRadius: 20,
            padding: '24px 20px',
            boxShadow: SHADOW,
            border: `1px solid ${BORDER}`,
            marginBottom: 16,
          }}
          dir="rtl"
        >
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: BLUE, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            TRACKING CODE
          </p>
          <div className="flex items-center justify-between gap-3">
            <span style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: NAVY,
              letterSpacing: '0.06em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {data.trackingCode}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyCode}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background: copied ? `${GREEN}15` : `${BLUE}12`,
                color: copied ? GREEN : BLUE,
                border: `1.5px solid ${copied ? GREEN + '40' : BLUE + '30'}`,
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <Copy size={16} weight="bold" />
              {copied ? 'تم!' : 'نسخ'}
            </motion.button>
          </div>
          <p style={{ fontSize: '0.8125rem', color: MUTED, marginTop: 10, lineHeight: 1.5 }}>
            احفظ هذا الكود باش تتبع كومندتك في أي وقت.
          </p>
        </motion.div>

        {/* Status timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: WHITE,
            borderRadius: 20,
            padding: '20px',
            boxShadow: SHADOW,
            border: `1px solid ${BORDER}`,
            marginBottom: 24,
          }}
          dir="rtl"
        >
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: BLUE, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            حالة الكومندة
          </p>
          <div className="space-y-0">
            {statusSteps.map((step, i) => (
              <div key={step.key} className="flex items-start gap-3">
                {/* Dot + line */}
                <div className="flex flex-col items-center" style={{ width: 20, flexShrink: 0 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: step.done ? GREEN : '#E8ECF0',
                    border: `2px solid ${step.done ? GREEN : '#CBD2D9'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {step.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div style={{ width: 2, height: 28, background: step.done ? `${GREEN}40` : '#E8ECF0', margin: '2px 0' }} />
                  )}
                </div>
                {/* Label */}
                <p style={{
                  fontSize: '0.9rem',
                  fontWeight: step.done ? 700 : 500,
                  color: step.done ? TEXT : '#9DA3A6',
                  paddingBottom: i < statusSteps.length - 1 ? 20 : 0,
                  paddingTop: 1,
                }}>
                  {step.label}
                  {step.done && (
                    <span style={{ fontSize: '0.75rem', color: GREEN, fontWeight: 600, marginRight: 8 }}>✓ الآن</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
          dir="rtl"
        >
          <button
            onClick={() => navigate(`/track?code=${data.trackingCode}`)}
            style={{
              width: '100%',
              padding: '15px 20px',
              borderRadius: 999,
              background: BLUE,
              color: WHITE,
              fontWeight: 700,
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(0,112,186,0.3)',
              transition: 'all 0.18s ease',
            }}
          >
            <MagnifyingGlass size={20} weight="bold" />
            تتبع كومندتي
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 999,
              background: WHITE,
              color: BLUE,
              fontWeight: 700,
              fontSize: '1rem',
              border: `1.5px solid ${BLUE}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.18s ease',
            }}
          >
            <House size={20} weight="bold" />
            الصفحة الرئيسية
          </button>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ textAlign: 'center', color: '#9DA3A6', fontSize: '0.8125rem', marginTop: 24, lineHeight: 1.6 }}
          dir="rtl"
        >
          سنتواصل معك على الهاتف خلال 24 ساعة لتأكيد الطلب والسعر النهائي.
        </motion.p>
      </div>
    </div>
  );
}
