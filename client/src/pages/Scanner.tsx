import { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

/* ── Help Page ─────────────────────────────────────────────────────────── */
function HelpPage({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: '#000', color: '#fff', paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <button onClick={onClose} className="text-white p-2 -ml-2">
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-white font-semibold text-base">Aide — Scanner</span>
        <div className="w-10" />
      </div>
      <div className="px-5 pb-10 space-y-8">
        <HelpSection
          title="Qu'est-ce que la Recherche avec appareil photo ?"
          body="La fonction Recherche avec appareil photo vous permet de rechercher des produits à l'aide de votre appareil photo. Vous pouvez l'utiliser pour trouver des produits comme des livres, des jouets, des jeux vidéos, des appareils électroniques, des articles ménagers et de cuisine, des vêtements, des chaussures et des montres."
        />
        <HelpSection
          title="Comment puis-je rechercher des produits ?"
          body="Pointez votre appareil photo sur un produit et appuyez sur le bouton de recherche. Affiche ensuite les résultats qui correspondent à votre recherche. Autrement, vous pouvez sélectionner une photo de la galerie photo de votre téléphone."
        />
        <HelpSection
          title="Comment extraire le prix d'un produit ?"
          body="Prenez en photo l'étiquette de prix ou la page produit sur Shein, AliExpress ou Temu. Notre IA extrait le prix et le convertit en dinars tunisiens (TND) automatiquement."
        />
        <HelpSection
          title="De quelle manière les utilisateurs emploient-ils la fonction ?"
          body="De nombreuses personnes utilisent la fonction Recherche avec appareil photo lorsqu'elles trouvent un produit intéressant et qu'elles souhaitent l'acheter sur Bysis ou en savoir plus à son sujet."
        />
        <HelpSection
          title="Je ne parviens pas à obtenir les résultats que je recherche."
          body="Assurez-vous que la totalité du produit se trouve dans la vue de l'appareil avant de lancer la recherche. Vérifiez que le produit est bien éclairé. Si le produit est trop éloigné, rapprochez-vous ou zoomez."
        />
      </div>
    </div>
  );
}

function HelpSection({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-white font-bold text-base leading-snug">{title}</h2>
      <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

/* ── Sparkle Star ───────────────────────────────────────────────────────── */
function SparkleStar({ size = 12, color = 'white' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill={color}>
      <path d="M6 0 L6.7 4.3 L11 6 L6.7 7.7 L6 12 L5.3 7.7 L1 6 L5.3 4.3 Z" />
    </svg>
  );
}

/* ── Flash Icon ─────────────────────────────────────────────────────────── */
function FlashIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        fill={active ? '#FFD700' : 'none'}
        stroke={active ? '#FFD700' : 'white'}
        strokeWidth="2"
      />
    </svg>
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
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  const [flashOn, setFlashOn] = useState(false);
  const [flashSupported, setFlashSupported] = useState<boolean | null>(null); // null = unknown
  const [mode, setMode] = useState<Mode>('camera');
  const [showHelp, setShowHelp] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);

  /* ── Start camera ── */
  const startCamera = useCallback(async () => {
    try {
      // First try to get the back camera specifically via enumerateDevices
      let backCameraId: string | undefined;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(d => d.kind === 'videoinput');
        // Last camera is usually the back camera on mobile
        if (cameras.length > 1) {
          backCameraId = cameras[cameras.length - 1].deviceId;
        }
      } catch {
        // ignore enumerate errors
      }

      const constraints: MediaStreamConstraints = {
        video: backCameraId
          ? { deviceId: { exact: backCameraId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      videoTrackRef.current = track;

      // Check torch support via getCapabilities
      try {
        const caps = track.getCapabilities?.() as any;
        setFlashSupported(!!caps?.torch);
      } catch {
        setFlashSupported(false);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraError(null);
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError("Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres.");
    }
  }, []);

  /* ── Stop camera ── */
  const stopCamera = useCallback(async () => {
    // Turn off torch before stopping
    const track = videoTrackRef.current;
    if (track) {
      try {
        await (track as any).applyConstraints({ advanced: [{ torch: false }] });
      } catch {}
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    videoTrackRef.current = null;
    setFlashOn(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Toggle flash (torch) ── */
  const toggleFlash = useCallback(async () => {
    const track = videoTrackRef.current;
    if (!track) {
      console.warn('No video track available for torch');
      return;
    }

    const newState = !flashOn;

    try {
      // Method 1: applyConstraints with advanced torch
      await (track as any).applyConstraints({
        advanced: [{ torch: newState }],
      });
      setFlashOn(newState);
      console.log(`Torch ${newState ? 'ON' : 'OFF'} via applyConstraints`);
    } catch (err1) {
      console.warn('applyConstraints torch failed:', err1);
      // Method 2: Try direct constraint (some browsers)
      try {
        await (track as any).applyConstraints({ torch: newState } as any);
        setFlashOn(newState);
        console.log(`Torch ${newState ? 'ON' : 'OFF'} via direct constraint`);
      } catch (err2) {
        console.warn('Direct torch constraint also failed:', err2);
        // Method 3: Restart stream with torch constraint
        try {
          await stopCamera();
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              // @ts-ignore
              advanced: [{ torch: newState }],
            },
            audio: false,
          });
          streamRef.current = stream;
          const newTrack = stream.getVideoTracks()[0];
          videoTrackRef.current = newTrack;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
          setFlashOn(newState);
          console.log(`Torch ${newState ? 'ON' : 'OFF'} via stream restart`);
        } catch (err3) {
          console.error('All torch methods failed:', err3);
        }
      }
    }
  }, [flashOn, stopCamera]);

  /* ── Capture photo ── */
  const captureAndSearch = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      sessionStorage.setItem('scannerImage', url);
      navigate('/calculator');
    }, 'image/jpeg', 0.92);
  }, [navigate]);

  /* ── Upload from gallery ── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    sessionStorage.setItem('scannerImage', url);
    navigate('/calculator');
  };

  /* ── Barcode mode ── */
  useEffect(() => {
    if (mode !== 'barcode') return;
    let scanner: any;
    stopCamera();
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      scanner = new Html5Qrcode('barcode-reader');
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText: string) => {
          setBarcodeResult(decodedText);
          scanner.stop().catch(() => {});
        },
        () => {}
      ).catch(() => {});
    });
    return () => {
      scanner?.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    }
  }, [mode, startCamera]);

  if (showHelp) return <HelpPage onClose={() => setShowHelp(false)} />;

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        background: '#000',
        zIndex: 100,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ minHeight: '56px' }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-10 h-10 rounded-full active:bg-white/10 transition-colors"
          aria-label="Retour"
        >
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        {/* Title: "lens ai✦" — all white */}
        <div className="flex items-center gap-1">
          <span
            className="font-semibold text-lg tracking-tight"
            style={{ color: 'white', fontFamily: '"Inter", sans-serif' }}
          >
            lens
          </span>
          <span
            className="font-semibold text-lg tracking-tight italic"
            style={{ color: 'white', fontFamily: '"Inter", sans-serif' }}
          >
            ai
          </span>
          <span style={{ marginBottom: '6px', display: 'inline-flex' }}>
            <SparkleStar size={11} color="white" />
          </span>
        </div>

        {/* Right: Flash + Help */}
        <div className="flex items-center gap-1">
          {/* Flash button */}
          <button
            onClick={toggleFlash}
            className="flex items-center justify-center w-10 h-10 rounded-full active:bg-white/10 transition-colors"
            aria-label={flashOn ? 'Éteindre le flash' : 'Allumer le flash'}
            style={{ opacity: flashSupported === false ? 0.4 : 1 }}
          >
            <FlashIcon active={flashOn} />
          </button>
          {/* Help button */}
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full active:bg-white/10 transition-colors"
            aria-label="Aide"
          >
            <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="9" />
              <path d="M8.5 8.5a2.5 2.5 0 0 1 4.87.83c0 1.67-2.5 2.5-2.5 2.5" />
              <circle cx="11" cy="15.5" r="0.5" fill="white" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Camera / Barcode View ────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        {mode === 'camera' ? (
          <>
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8">
                <svg width="48" height="48" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                  <rect x="2" y="8" width="44" height="34" rx="5" />
                  <circle cx="24" cy="25" r="9" />
                  <path d="M16 8l3-5h10l3 5" />
                </svg>
                <p className="text-white/70 text-center text-sm leading-relaxed">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold active:scale-95 transition-transform"
                >
                  Réessayer
                </button>
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

            {/* Hint text */}
            {!cameraError && (
              <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
                <div
                  className="rounded-full px-4 py-2"
                  style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
                >
                  <p className="text-white text-xs text-center font-medium">
                    Prendre une photo pour rechercher des produits
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Barcode mode */
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {barcodeResult ? (
              <div className="text-center px-8">
                <p className="text-white/60 text-sm mb-2">Code détecté :</p>
                <p className="text-green-400 font-mono text-lg break-all">{barcodeResult}</p>
                <button
                  onClick={() => { setBarcodeResult(null); setMode('camera'); }}
                  className="mt-6 px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold active:scale-95 transition-transform"
                >
                  Nouvelle recherche
                </button>
              </div>
            ) : (
              <>
                <div id="barcode-reader" className="w-full max-w-xs" />
                <p className="text-white/70 text-sm mt-5 text-center px-8">
                  Pointez la caméra vers un code-barres ou QR code
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Controls ─────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-10"
        style={{
          paddingTop: '20px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
        }}
      >
        {/* Left: Upload from gallery */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
          aria-label="Choisir une image"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)' }}
          >
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="white" stroke="none" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <span className="text-white/70 text-[10px] font-medium">Galerie</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

        {/* Center: Capture button */}
        <button
          onClick={captureAndSearch}
          className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
          aria-label="Prendre une photo"
          disabled={mode === 'barcode'}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              border: '3px solid rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="w-[62px] h-[62px] rounded-full flex items-center justify-center"
              style={{ background: 'white' }}
            >
              <svg width="26" height="26" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7.5" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </div>
          </div>
          <span className="text-white/70 text-[10px] font-medium">Rechercher</span>
        </button>

        {/* Right: Barcode scanner toggle */}
        <button
          onClick={() => setMode(m => m === 'barcode' ? 'camera' : 'barcode')}
          className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
          aria-label="Scanner un code-barres"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: mode === 'barcode' ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.15)',
              border: mode === 'barcode' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.25)',
            }}
          >
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9V6a2 2 0 0 1 2-2h3" />
              <path d="M15 4h3a2 2 0 0 1 2 2v3" />
              <path d="M20 15v3a2 2 0 0 1-2 2h-3" />
              <path d="M9 20H6a2 2 0 0 1-2-2v-3" />
              <line x1="7" y1="8" x2="7" y2="16" strokeWidth="1.5" />
              <line x1="9.5" y1="8" x2="9.5" y2="16" strokeWidth="2.5" />
              <line x1="12" y1="8" x2="12" y2="16" strokeWidth="1" />
              <line x1="14" y1="8" x2="14" y2="16" strokeWidth="2" />
              <line x1="16.5" y1="8" x2="16.5" y2="16" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-white/70 text-[10px] font-medium">Barcode</span>
        </button>
      </div>
    </div>
  );
}
