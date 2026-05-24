'use client';
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import AppLayout from '@/components/AppLayout';
import { useChatContext } from '@/App';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload, X, ArrowLeft, Scan,
  CheckCircle, ArrowRight,
} from '@phosphor-icons/react';

const BG     = '#FFFFFF';
const WHITE  = '#FFFFFF';
const RED    = '#E8192C';
const BLACK  = '#1A1A1A';
const TEXT   = '#1D1D1D';
const GRAY2  = '#666666';
const GRAY3  = '#999999';
const BORDER = '#E5E5E5';
const GREEN  = '#00A651';
const SHADOW = '0 1px 4px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.05)';
const SHADOW_MD = '0 4px 16px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)';

interface CalculationResult {
  originalPrice: string;
  originalCurrency: string;
  priceEur: string;
  priceTnd: string;
  confidence: string;
  confidencePercent: number;
  imageUrl: string;
  timestamp: number;
}

type Mode = 'choice' | 'camera' | 'result';

export default function Calculator() {
  const [, navigate] = useLocation();
  const { openChat } = useChatContext();

  const [mode, setMode]             = useState<Mode>('choice');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64]   = useState<string | null>(null);
  const [result, setResult]         = useState<CalculationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const estimatedDurationRef = useRef<number>(3000);

  const extractPrice = trpc.calculator.extractPrice.useMutation();

  // Stable device ID — used to isolate scan history per browser
  const deviceId = (() => {
    const KEY = 'bysis_device_id';
    let id = localStorage.getItem(KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(KEY, id); }
    return id;
  })();

  useEffect(() => {
    if (mode === 'camera') {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch {
          toast.error('Accès caméra refusé');
          setMode('choice');
        }
      };
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [mode]);

  const captureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    canvasRef.current.width  = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.85);
    setImageBase64(base64);
    setImagePreview(base64);
    setMode('result');
    startScanning(base64);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
      setMode('result');
      startScanning(base64);
    };
    reader.readAsDataURL(file);
  };

  const startScanning = async (base64: string) => {
    setIsScanning(true);
    setScanProgress(0);
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / estimatedDurationRef.current) * 100, 99);
      setScanProgress(Math.round(progress));
    }, 50);
    try {
      const response = await extractPrice.mutateAsync({ imageBase64: base64, deviceId });
      setScanProgress(100);
      clearInterval(interval);
      const api = response as any;
      const newResult: CalculationResult = {
        originalPrice:    api.originalPrice || '',
        originalCurrency: api.originalCurrency || '',
        priceEur:         api.priceEur || api.priceInTND?.toString() || '0',
        priceTnd:         api.priceInTND?.toString() || '0',
        confidence:       api.confidence || 'High Confidence',
        confidencePercent: parseInt(api.confidence?.match(/\d+/)?.[0] || '0'),
        imageUrl:         base64,
        timestamp:        Date.now(),
      };
      setResult(newResult);
      estimatedDurationRef.current = Math.max(Date.now() - startTimeRef.current, 2000);
      setTimeout(() => setIsScanning(false), 400);
    } catch {
      clearInterval(interval);
      setIsScanning(false);
      toast.error("Impossible d'extraire le prix. Réessayez.");
    }
  };

  const reset = () => {
    setResult(null);
    setImagePreview(null);
    setImageBase64(null);
    setScanProgress(0);
    setMode('choice');
  };

  return (
    <AppLayout onChatOpen={openChat}>
      <div className="min-h-screen safe-area-top safe-area-bottom" style={{ background: '#FFFFFF' }}>
        <AnimatePresence mode="wait">

          {/* ── CHOICE SCREEN ── */}
          {mode === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="px-5 pt-10 pb-24"
            >
              <div className="max-w-md mx-auto">
                <div className="mb-8">
                  <p className="pp-label mb-2">CALCULATEUR</p>
                  <h1 className="mb-2" style={{ color: TEXT }}>Calculer le prix</h1>
                  <p style={{ color: '#666666', fontSize: '0.9375rem' }}>
                    Scannez un produit avec la caméra ou importez une image depuis votre galerie.
                  </p>
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setMode('camera')}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-150"
                    style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: SHADOW }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,25,44,0.10)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = SHADOW; }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#F5F5F5' }}>
                      <Camera size={28} weight="duotone" style={{ color: '#E8192C' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base mb-0.5" style={{ color: TEXT, fontFamily: 'Inter, sans-serif' }}>Prendre une photo</div>
                      <div className="text-sm" style={{ color: '#999999' }}>Utilisez la caméra de votre appareil</div>
                    </div>
                    <ArrowRight size={20} style={{ color: '#999999', flexShrink: 0 }} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-150"
                    style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: SHADOW }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,25,44,0.10)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = SHADOW; }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#F5F5F5' }}>
                      <Upload size={28} weight="duotone" style={{ color: '#E8192C' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base mb-0.5" style={{ color: TEXT, fontFamily: 'Inter, sans-serif' }}>Importer une image</div>
                      <div className="text-sm" style={{ color: '#999999' }}>Choisissez depuis votre galerie</div>
                    </div>
                    <ArrowRight size={20} style={{ color: '#999999', flexShrink: 0 }} />
                  </motion.button>
                </div>

                <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#F5F5F5', border: '1px solid rgba(232,25,44,0.15)' }}>
                  <Scan size={20} weight="duotone" style={{ color: '#E8192C', flexShrink: 0, marginTop: 1 }} />
                  <p className="text-sm leading-relaxed" style={{ color: '#666666' }}>
                    Prenez en photo l'étiquette de prix ou la page produit sur Shein, AliExpress ou Temu.
                    Notre IA extrait le prix et le convertit en <strong style={{ color: TEXT }}>dinars tunisiens (TND)</strong>.
                  </p>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>
            </motion.div>
          )}

          {/* ── CAMERA SCREEN ── */}
          {mode === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full"
              style={{ height: '100dvh', background: '#000' }}
            >
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-4 safe-area-top"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)' }}>
                <button
                  onClick={() => setMode('choice')}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                >
                  <ArrowLeft size={20} className="text-white" />
                </button>
                <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Caméra</span>
                <div className="w-10" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 relative">
                  {['top-0 left-0 border-t-2 border-l-2 rounded-tl-lg','top-0 right-0 border-t-2 border-r-2 rounded-tr-lg','bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg','bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg'].map((cls, i) => (
                    <div key={i} className={`absolute w-8 h-8 ${cls}`} style={{ borderColor: '#E8192C' }} />
                  ))}
                  <motion.div
                    animate={{ top: ['8%', '88%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-0.5"
                    style={{ background: 'linear-gradient(90deg, transparent, #E8192C, transparent)' }}
                  />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 safe-area-bottom"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)', paddingBottom: '2rem' }}>
                <div className="flex items-center justify-center gap-8 pt-8">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                    <Upload size={22} className="text-white" weight="bold" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.93 }} onClick={captureFromCamera}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: WHITE, boxShadow: '0 0 0 4px rgba(255,255,255,0.3), 0 8px 24px rgba(0,0,0,0.4)' }}>
                    <div className="w-16 h-16 rounded-full" style={{ background: RED }} />
                  </motion.button>
                  <div className="w-12 h-12" />
                </div>
                <p className="text-center text-white/60 text-xs mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>Pointez vers l'étiquette de prix</p>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
          )}

          {/* ── RESULT SCREEN ── */}
          {mode === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="px-5 pt-8 pb-24"
            >
              <div className="max-w-md mx-auto">
                <button onClick={reset} className="flex items-center gap-2 mb-6 text-sm font-medium" style={{ color: '#E8192C' }}>
                  <ArrowLeft size={18} />
                  Nouvelle analyse
                </button>

                {imagePreview && (
                  <div className="mb-5 rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}`, boxShadow: SHADOW_MD }}>
                    <img src={imagePreview} alt="Produit" className="w-full object-cover" style={{ maxHeight: 220 }} />
                  </div>
                )}

                {isScanning && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mb-5 p-5 rounded-2xl"
                    style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: SHADOW }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#F5F5F5' }}>
                        <Scan size={18} weight="duotone" style={{ color: '#E8192C' }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: TEXT, fontFamily: 'Inter, sans-serif' }}>Analyse en cours…</div>
                        <div className="text-xs" style={{ color: '#999999' }}>Extraction du prix par IA</div>
                      </div>
                      <div className="ml-auto font-bold text-sm" style={{ color: '#E8192C' }}>{scanProgress}%</div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#FFFFFF' }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${RED}, ${BLACK})` }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.1 }} />
                    </div>
                  </motion.div>
                )}

                {result && !isScanning && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
                    <div className="mb-4 p-6 rounded-2xl" style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: SHADOW_MD }}>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle size={20} weight="fill" style={{ color: GREEN }} />
                        <span className="font-semibold text-sm" style={{ color: GREEN, fontFamily: 'Inter, sans-serif' }}>Prix extrait avec succès</span>
                      </div>
                      <div className="text-center py-4 mb-4 rounded-xl" style={{ background: '#FFFFFF' }}>
                        <div className="font-extrabold leading-none mb-1"
                          style={{ fontSize: 'clamp(2rem, 8vw, 2.75rem)', color: '#1A1A1A', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
                          {result.priceTnd} <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>TND</span>
                        </div>
                        <div className="text-sm font-medium" style={{ color: '#999999' }}>≈ {result.priceEur} EUR</div>
                      </div>
                      <div className="space-y-2">
                        {result.originalPrice && (
                          <div className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                            <span className="text-sm" style={{ color: '#999999' }}>Prix original</span>
                            <span className="text-sm font-semibold" style={{ color: TEXT }}>{result.originalPrice} {result.originalCurrency}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm" style={{ color: '#999999' }}>Confiance IA</span>
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: '#FFFFFF' }}>
                              <div className="h-full rounded-full" style={{ width: `${result.confidencePercent}%`, background: result.confidencePercent > 70 ? GREEN : '#E07B00' }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: result.confidencePercent > 70 ? GREEN : '#E07B00' }}>{result.confidencePercent}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <button onClick={() => navigate('/order')}
                        className="w-full py-3.5 font-semibold text-white rounded-3xl transition-all active:scale-[0.97]"
                        style={{ background: RED, fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(232,25,44,0.30)' }}>
                        Commander maintenant
                      </button>
                      <button onClick={reset}
                        className="w-full py-3.5 font-semibold rounded-3xl transition-all active:scale-[0.97]"
                        style={{ background: WHITE, color: '#E8192C', border: `1.5px solid ${RED}`, fontFamily: 'Inter, sans-serif' }}>
                        Nouvelle analyse
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
