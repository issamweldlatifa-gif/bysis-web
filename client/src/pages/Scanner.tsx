import { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

/* ── Help Page ─────────────────────────────────────────────────────────── */
function HelpPage({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: '#000', color: '#fff', paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button onClick={onClose} className="text-white p-1">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-white font-semibold text-base">Aide — Recherche photo</span>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="px-5 pb-10 space-y-8">
        <Section
          title="Qu'est-ce que la Recherche avec appareil photo ?"
          body="La fonction Recherche avec appareil photo vous permet de rechercher des produits à l'aide de votre appareil photo. Vous pouvez l'utiliser pour trouver des produits comme des livres, des jouets, des jeux vidéos, des appareils électroniques, des articles ménagers et de cuisine, des vêtements, des chaussures et des montres."
        />
        <Section
          title="Comment puis-je rechercher des produits ?"
          body="Pointez votre appareil photo sur un produit et appuyez sur le bouton de recherche. Affiche ensuite les résultats qui correspondent à votre recherche. Autrement, vous pouvez sélectionner une photo de la galerie photo de votre téléphone."
        />
        <Section
          title="Comment extraire le prix d'un produit ?"
          body="Prenez en photo l'étiquette de prix ou la page produit sur Shein, AliExpress ou Temu. Notre IA extrait le prix et le convertit en dinars tunisiens (TND) automatiquement."
        />
        <Section
          title="De quelle manière les utilisateurs emploient-ils la fonction ?"
          body="De nombreuses personnes utilisent la fonction Recherche avec appareil photo lorsqu'elles trouvent un produit intéressant et qu'elles souhaitent l'acheter sur Bysis ou en savoir plus à son sujet. Les clients utilisent également la fonction pour commander à nouveau des articles."
        />
        <Section
          title="Je ne parviens pas à obtenir les résultats que je recherche. Que se passe-t-il ?"
          body="Assurez-vous que la totalité du produit se trouve dans la vue de l'appareil avant de lancer la recherche. Vérifiez que le produit est bien éclairé, mais pas trop. Si le produit que vous recherchez est trop éloigné, vous pouvez vous rapprocher ou pincer et zoomer sur l'appareil photo afin que le produit en entier se trouve dans la vue."
        />
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-white font-bold text-lg leading-snug">{title}</h2>
      <p className="text-gray-300 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

/* ── Main Scanner Page ──────────────────────────────────────────────────── */
type Mode = 'camera' | 'barcode';

export default function Scanner() {
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [flashOn, setFlashOn] = useState(false);
  const [mode, setMode] = useState<Mode>('camera');
  const [showHelp, setShowHelp] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);

  /* Start camera */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraError(null);
    } catch {
      setCameraError("Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres.");
    }
  }, []);

  /* Stop camera */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  /* Toggle flash */
  const toggleFlash = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      // @ts-ignore - torch is not in standard TS types
      await track.applyConstraints({ advanced: [{ torch: !flashOn }] });
      setFlashOn(f => !f);
    } catch {
      // Flash not supported on this device
    }
  };

  /* Capture photo and navigate to calculator */
  const captureAndSearch = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' });
      const url = URL.createObjectURL(file);
      // Store in sessionStorage and navigate to calculator
      sessionStorage.setItem('scannerImage', url);
      navigate('/calculator');
    }, 'image/jpeg', 0.9);
  };

  /* Upload from gallery */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    sessionStorage.setItem('scannerImage', url);
    navigate('/calculator');
  };

  /* Barcode mode: use html5-qrcode */
  useEffect(() => {
    if (mode !== 'barcode') return;
    let scanner: any;
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      scanner = new Html5Qrcode('barcode-reader');
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          setBarcodeResult(decodedText);
          scanner.stop();
        },
        () => {}
      ).catch(() => {});
    });
    return () => {
      scanner?.stop().catch(() => {});
    };
  }, [mode]);

  if (showHelp) return <HelpPage onClose={() => setShowHelp(false)} />;

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ background: '#000', paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 z-10 relative">
        {/* Back */}
        <button onClick={() => navigate('/')} className="text-white p-1">
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        {/* Title */}
        <div className="flex items-center gap-1">
          <span className="text-white font-semibold text-lg tracking-tight">lens</span>
          <span className="text-white font-semibold text-lg tracking-tight italic">ai</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white" className="mb-2">
            <path d="M7 0 L7.8 5.2 L13 7 L7.8 8.8 L7 14 L6.2 8.8 L1 7 L6.2 5.2 Z" />
          </svg>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Flash */}
          <button onClick={toggleFlash} className="text-white p-1">
            <svg width="24" height="24" fill="none" stroke={flashOn ? '#FFD700' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </button>
          {/* Help */}
          <button onClick={() => setShowHelp(true)} className="text-white p-1">
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Camera / Barcode View ── */}
      <div className="flex-1 relative overflow-hidden">
        {mode === 'camera' ? (
          <>
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-center px-8 text-sm">{cameraError}</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {barcodeResult ? (
              <div className="text-center px-8">
                <p className="text-white text-sm mb-2">Code détecté :</p>
                <p className="text-green-400 font-mono text-lg break-all">{barcodeResult}</p>
                <button
                  onClick={() => { setBarcodeResult(null); setMode('camera'); }}
                  className="mt-4 px-6 py-2 bg-white text-black rounded-full text-sm font-medium"
                >
                  Nouvelle recherche
                </button>
              </div>
            ) : (
              <>
                <div id="barcode-reader" className="w-full max-w-xs" />
                <p className="text-white text-sm mt-4 text-center px-8">
                  Pointez la caméra vers un code-barres ou QR code
                </p>
              </>
            )}
          </div>
        )}

        {/* Hint text */}
        {mode === 'camera' && !cameraError && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/60 rounded-full px-4 py-2">
              <p className="text-white text-sm text-center">
                Prendre une photo pour rechercher des produits
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Controls ── */}
      <div
        className="flex items-center justify-around px-8 py-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        {/* Upload from gallery */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"
        >
          <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
            <path d="M7 6h.01" />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

        {/* Capture / Search button */}
        <button
          onClick={captureAndSearch}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <svg width="28" height="28" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        </button>

        {/* Barcode scanner */}
        <button
          onClick={() => setMode(m => m === 'barcode' ? 'camera' : 'barcode')}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${mode === 'barcode' ? 'bg-white/40' : 'bg-white/20'}`}
        >
          <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9V6a3 3 0 0 1 3-3h3" />
            <path d="M15 3h3a3 3 0 0 1 3 3v3" />
            <path d="M21 15v3a3 3 0 0 1-3 3h-3" />
            <path d="M9 21H6a3 3 0 0 1-3-3v-3" />
            <rect x="7" y="7" width="3" height="10" rx="0.5" />
            <rect x="11" y="7" width="1.5" height="10" rx="0.5" />
            <rect x="14" y="7" width="3" height="10" rx="0.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
