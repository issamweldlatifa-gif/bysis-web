'use client';

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, Search, House, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

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
    { key: 'received',  label: 'Commande reçue',        done: true  },
    { key: 'purchase',  label: 'En cours d\'achat',      done: false },
    { key: 'shipping',  label: 'En livraison',           done: false },
    { key: 'arrived',   label: 'Arrivée en Tunisie',     done: false },
    { key: 'delivered', label: 'Livré',                  done: false },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF', fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-md mx-auto px-4 pt-10 pb-24">

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'rgba(0,166,81,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(0,166,81,0.25)',
          }}>
            <CheckCircle size={48} style={{ color: '#00A651' }} strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            fontWeight: 900,
            color: '#0A0A0A',
            fontFamily: '"Barlow Condensed", Poppins, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            lineHeight: 1,
            marginBottom: 12,
          }}>
            Commande confirmée !
          </h1>
          <p style={{ color: '#888888', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Bonjour <strong style={{ color: '#0A0A0A' }}>{data.customerName}</strong>,<br />
            nous vous contacterons bientôt pour confirmer les détails.
          </p>
        </motion.div>

        {/* Tracking code card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '24px 20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid #E8E8E8',
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#888888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Code de suivi
          </p>
          <div className="flex items-center justify-between gap-3">
            <span style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#0A0A0A',
              letterSpacing: '0.04em',
              fontFamily: '"Barlow Condensed", Poppins, sans-serif',
            }}>
              {data.trackingCode}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyCode}
              style={{
                padding: '10px 18px',
                borderRadius: 36,
                background: copied ? 'rgba(0,166,81,0.1)' : '#F5F5F5',
                color: copied ? '#00A651' : '#0A0A0A',
                border: `1.5px solid ${copied ? 'rgba(0,166,81,0.3)' : '#E8E8E8'}`,
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <Copy size={15} strokeWidth={1.5} />
              {copied ? 'Copié !' : 'Copier'}
            </motion.button>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#888888', marginTop: 10, lineHeight: 1.5 }}>
            Conservez ce code pour suivre votre commande à tout moment.
          </p>
        </motion.div>

        {/* Status timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid #E8E8E8',
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#888888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            Statut de la commande
          </p>
          <div className="space-y-0">
            {statusSteps.map((step, i) => (
              <div key={step.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center" style={{ width: 20, flexShrink: 0 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: step.done ? '#00A651' : '#F0F0F0',
                    border: `2px solid ${step.done ? '#00A651' : '#E8E8E8'}`,
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
                    <div style={{ width: 2, height: 28, background: step.done ? 'rgba(0,166,81,0.3)' : '#F0F0F0', margin: '2px 0' }} />
                  )}
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  fontWeight: step.done ? 700 : 500,
                  color: step.done ? '#0A0A0A' : '#AAAAAA',
                  paddingBottom: i < statusSteps.length - 1 ? 20 : 0,
                  paddingTop: 1,
                }}>
                  {step.label}
                  {step.done && (
                    <span style={{ fontSize: '0.75rem', color: '#00A651', fontWeight: 600, marginLeft: 8 }}>✓ Maintenant</span>
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
        >
          <button
            onClick={() => navigate(`/track?code=${data.trackingCode}`)}
            className="btn-nike-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Search size={18} strokeWidth={1.5} />
            Suivre ma commande
          </button>

          <button
            onClick={() => navigate('/')}
            className="btn-nike-white"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <House size={18} strokeWidth={1.5} />
            Retour à l'accueil
          </button>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ textAlign: 'center', color: '#AAAAAA', fontSize: '0.8125rem', marginTop: 24, lineHeight: 1.6 }}
        >
          Nous vous contacterons par téléphone dans les 24h pour confirmer la commande et le prix final.
        </motion.p>
      </div>
    </div>
  );
}
