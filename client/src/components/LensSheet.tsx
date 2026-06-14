import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  slug: string;
  priceTnd: number;
  priceEur: number | null;
  originalPrice: number | null;
  discount: number | null;
  imageUrl: string | null;
  platform: string | null;
  stock: number;
  rating: string | null;
  categoryId: number;
}

interface LensSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "camera" | "gallery" | "text" | "voice";

// ─── Platform badge colors ────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  shein: "#FF6B9D",
  aliexpress: "#FF4500",
  temu: "#FF6600",
  local: "#D4AF37",
};

// ─── Product Card with Price Tracking + AR Try-On ─────────────────────────────
function ProductCard({
  product,
  sessionId,
  onTrackPrice,
  onArTryOn,
}: {
  product: Product;
  sessionId: string;
  onTrackPrice: (product: Product) => void;
  onArTryOn: (product: Product) => void;
}) {
  const discount = product.discount ?? 0;
  const platform = product.platform ?? "local";
  const platformColor = PLATFORM_COLORS[platform] ?? "#D4AF37";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 bg-[#111] rounded-xl p-3 border border-white/5 cursor-pointer"
    >
      {/* Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl">📦</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium line-clamp-2 leading-tight">{product.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[#D4AF37] font-bold text-sm">{product.priceTnd} DT</span>
          {discount > 0 && (
            <span className="text-white/40 text-xs line-through">{product.originalPrice} DT</span>
          )}
          {discount > 0 && (
            <span className="text-green-400 text-xs font-medium">-{discount}%</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: platformColor + "22", color: platformColor }}
          >
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </span>
          {product.rating && parseFloat(product.rating) > 0 && (
            <span className="text-white/40 text-xs">⭐ {parseFloat(product.rating).toFixed(1)}</span>
          )}
        </div>
        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onTrackPrice(product); }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 text-white/50 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Suivre prix
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onArTryOn(product); }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 text-white/50 hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
              <path d="M20 21a8 8 0 1 0-16 0"/>
            </svg>
            Essayer
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex gap-3 bg-[#111] rounded-xl p-3 border border-white/5 animate-pulse">
      <div className="w-20 h-20 rounded-lg bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-3 bg-white/10 rounded w-1/4" />
      </div>
    </div>
  );
}

// ─── AI Analysis Badge ────────────────────────────────────────────────────────
function AnalysisBadge({ analysis }: {
  analysis: { productType: string; colors: string[]; keywords: string[]; confidence: number; platform: string | null; estimatedPrice: number | null; similarityScore?: number };
}) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider">Lens AI✦</span>
        <span className="text-white/40 text-xs">
          {Math.round(analysis.confidence * 100)}% confiance
        </span>
        {analysis.similarityScore !== undefined && (
          <span className="text-purple-400 text-xs">
            {Math.round(analysis.similarityScore * 100)}% similarité
          </span>
        )}
      </div>
      <p className="text-white font-semibold text-sm">{analysis.productType}</p>
      {analysis.colors.length > 0 && (
        <p className="text-white/50 text-xs mt-1">{analysis.colors.join(" · ")}</p>
      )}
      {analysis.estimatedPrice && (
        <p className="text-[#D4AF37] text-xs mt-1">~{analysis.estimatedPrice} DT</p>
      )}
    </div>
  );
}

// ─── AR Try-On Modal ──────────────────────────────────────────────────────────
function ArTryOnModal({
  product,
  sessionId,
  onClose,
}: {
  product: Product;
  sessionId: string;
  onClose: () => void;
}) {
  const [userPhotoBase64, setUserPhotoBase64] = useState<string | null>(null);
  const [tryOnId, setTryOnId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const arTryOnMutation = trpc.lens.arTryOn.useMutation({
    onSuccess: (data) => {
      if (data.id) setTryOnId(data.id);
    },
  });

  const arResultQuery = trpc.lens.getArTryOnResult.useQuery(
    { id: tryOnId ?? 0 },
    {
      enabled: !!tryOnId,
      refetchInterval: (query) => {
        const data = query.state.data;
        if (data && (data.status === "done" || data.status === "failed")) return false;
        return 3000;
      },
    }
  );

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUserPhotoBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    if (!userPhotoBase64 || !product.imageUrl) return;
    arTryOnMutation.mutate({
      userPhotoBase64,
      productImageUrl: product.imageUrl,
      productName: product.name,
      sessionId,
    });
  };

  const resultData = arResultQuery.data;
  const isProcessing = arTryOnMutation.isPending || (!!tryOnId && resultData?.status === "processing");
  const isDone = resultData?.status === "done";
  const isFailed = resultData?.status === "failed";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1100] bg-black/90 flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <p className="text-white font-bold text-sm">AR Try-On</p>
          <p className="text-white/40 text-xs line-clamp-1">{product.name}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Product image */}
        <div className="flex gap-3 items-center bg-[#111] rounded-xl p-3">
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
          )}
          <div>
            <p className="text-white/60 text-xs">Produit sélectionné</p>
            <p className="text-white text-sm font-medium">{product.name}</p>
            <p className="text-[#D4AF37] text-xs">{product.priceTnd} DT</p>
          </div>
        </div>

        {/* User photo upload */}
        <div>
          <p className="text-white/60 text-xs mb-2">Votre photo</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          {!userPhotoBase64 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/40 hover:border-purple-500/50 hover:text-purple-400 transition-colors"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
                <path d="M20 21a8 8 0 1 0-16 0"/>
              </svg>
              <span className="text-sm">Choisir votre photo</span>
            </button>
          ) : (
            <div className="relative">
              <img src={userPhotoBase64} alt="user" className="w-full h-48 object-cover rounded-xl" />
              <button
                onClick={() => setUserPhotoBase64(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center"
              >✕</button>
            </div>
          )}
        </div>

        {/* Result */}
        {isDone && resultData?.resultImageUrl && (
          <div>
            <p className="text-green-400 text-xs mb-2">✓ Essayage généré</p>
            <img src={resultData.resultImageUrl} alt="AR Try-On Result" className="w-full rounded-xl" />
          </div>
        )}
        {isFailed && (
          <p className="text-red-400 text-sm text-center py-4">Génération échouée. Réessayez.</p>
        )}
        {isProcessing && (
          <div className="flex items-center gap-2 text-purple-400 text-sm py-4 justify-center">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            Génération en cours (15-30s)...
          </div>
        )}

        {/* Generate button */}
        {!tryOnId && (
          <button
            onClick={handleGenerate}
            disabled={!userPhotoBase64 || arTryOnMutation.isPending}
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
          >
            {arTryOnMutation.isPending ? "Envoi..." : "Générer l'essayage IA"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Price Tracking Toast ─────────────────────────────────────────────────────
function PriceTrackingToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 left-4 right-4 z-[1200] bg-[#D4AF37] text-black text-sm font-medium px-4 py-3 rounded-xl text-center"
    >
      {message}
    </motion.div>
  );
}

// ─── Main LensSheet Component ─────────────────────────────────────────────────
export default function LensSheet({ isOpen, onClose }: LensSheetProps) {
  const [activeTab, setActiveTab] = useState<Tab>("camera");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sessionId] = useState(() => `lens-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Phase 2+3 state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [arTryOnProduct, setArTryOnProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPriceList, setShowPriceList] = useState(false);
  const [multimodalTextQuery, setMultimodalTextQuery] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ─── tRPC hooks ──────────────────────────────────────────────────────────
  const analyzeImageMutation = trpc.lens.analyzeImage.useMutation();
  const multimodalMutation = trpc.lens.multimodalSearch.useMutation();
  const voiceSearchMutation = trpc.lens.voiceSearch.useMutation({
    onSuccess: (data) => {
      if (data.transcription) setVoiceTranscript(data.transcription);
    },
  });
  const trackPriceMutation = trpc.lens.trackPrice.useMutation({
    onSuccess: () => setToastMessage("Prix ajouté au suivi ✓"),
  });
  const priceTrackingQuery = trpc.lens.getPriceTracking.useQuery(
    { sessionId },
    { enabled: showPriceList }
  );
  const removePriceTrackingMutation = trpc.lens.removePriceTracking.useMutation({
    onSuccess: () => {
      priceTrackingQuery.refetch();
      setToastMessage("Supprimé du suivi");
    },
  });

  const textSearchQuery = trpc.lens.searchText.useQuery(
    { query: debouncedQuery, sessionId },
    { enabled: debouncedQuery.length >= 2 }
  );
  const trendingQuery = trpc.lens.trending.useQuery(undefined, { enabled: isOpen });

  // ─── Camera management ───────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      console.warn("Camera not available");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const toggleFlash = useCallback(async () => {
    if (!cameraStream) return;
    const track = cameraStream.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !flashOn } as MediaTrackConstraintSet] });
      setFlashOn((f) => !f);
    } catch {
      console.warn("Flash not supported");
    }
  }, [cameraStream, flashOn]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    // Use multimodal if there's a text query, else standard analyze
    if (multimodalTextQuery.trim()) {
      multimodalMutation.mutate({ imageBase64: dataUrl, textQuery: multimodalTextQuery, sessionId });
    } else {
      analyzeImageMutation.mutate({ imageBase64: dataUrl, sessionId });
    }
  }, [stopCamera, analyzeImageMutation, multimodalMutation, sessionId, multimodalTextQuery]);

  const handleFilePick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      if (multimodalTextQuery.trim()) {
        multimodalMutation.mutate({ imageBase64: dataUrl, textQuery: multimodalTextQuery, sessionId });
      } else {
        analyzeImageMutation.mutate({ imageBase64: dataUrl, sessionId });
      }
    };
    reader.readAsDataURL(file);
  }, [analyzeImageMutation, multimodalMutation, sessionId, multimodalTextQuery]);

  // ─── Voice recording ─────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // Convert to base64 and call tRPC mutation
        const reader = new FileReader();
        reader.onload = (ev) => {
          const audioBase64 = ev.target?.result as string;
          voiceSearchMutation.mutate({ audioBase64, sessionId, language: "fr" });
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch {
      console.warn("Microphone not available");
    }
  }, [sessionId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  // ─── Price tracking ───────────────────────────────────────────────────────
  const handleTrackPrice = useCallback((product: Product) => {
    trackPriceMutation.mutate({
      sessionId,
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl ?? undefined,
      platform: product.platform ?? "bysis",
      currentPrice: product.priceTnd,
    });
  }, [trackPriceMutation, sessionId]);

  // Text search debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(textQuery), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [textQuery]);

  // Start/stop camera based on tab and open state
  useEffect(() => {
    if (isOpen && activeTab === "camera" && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => { stopCamera(); };
  }, [isOpen, activeTab, capturedImage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setCapturedImage(null);
      setTextQuery("");
      setDebouncedQuery("");
      setFlashOn(false);
      setVoiceTranscript("");
      setMultimodalTextQuery("");
      setShowPriceList(false);
      analyzeImageMutation.reset();
      multimodalMutation.reset();
      voiceSearchMutation.reset();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Derived state ───────────────────────────────────────────────────────
  const isAnalyzing = analyzeImageMutation.isPending || multimodalMutation.isPending;
  const analysisResult = multimodalMutation.data ?? analyzeImageMutation.data;
  const analysisError = analyzeImageMutation.error ?? multimodalMutation.error;

  const voiceResults = voiceSearchMutation.data?.results ?? [];
  const voiceQuery = voiceSearchMutation.data?.query ?? voiceTranscript;

  const displayProducts: Product[] =
    activeTab === "camera" || activeTab === "gallery"
      ? (analysisResult?.results ?? trendingQuery.data ?? []) as Product[]
      : activeTab === "voice"
      ? (voiceResults as Product[])
      : (textSearchQuery.data?.results ?? trendingQuery.data ?? []) as Product[];

  const isLoading =
    isAnalyzing ||
    voiceSearchMutation.isPending ||
    (activeTab === "text" && textSearchQuery.isFetching);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "camera", label: "Caméra", icon: "📷" },
    { id: "gallery", label: "Galerie", icon: "🖼️" },
    { id: "text", label: "Texte", icon: "🔍" },
    { id: "voice", label: "Voix", icon: "🎤" },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 bg-black/60 z-[900]"
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
              className="fixed left-0 right-0 bottom-[64px] z-[950] flex flex-col"
              style={{ height: "calc(100dvh - 64px)", maxHeight: "calc(100dvh - 64px)" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1 bg-[#000] rounded-t-2xl">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#000]">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-base">lens</span>
                  <span className="text-[#D4AF37] text-base font-bold">ai✦</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Price tracking list toggle */}
                  <button
                    onClick={() => setShowPriceList((v) => !v)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showPriceList ? "bg-[#D4AF37] text-black" : "bg-white/10 text-white/70"}`}
                    title="Suivi des prix"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Price Tracking List Panel */}
              <AnimatePresence>
                {showPriceList && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#0a0a0a] border-b border-white/10 overflow-hidden"
                  >
                    <div className="px-4 py-3 max-h-48 overflow-y-auto">
                      <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">Suivi des prix</p>
                      {priceTrackingQuery.isLoading && <p className="text-white/40 text-xs">Chargement...</p>}
                      {priceTrackingQuery.data?.length === 0 && (
                        <p className="text-white/40 text-xs">Aucun produit suivi. Appuyez sur "Suivre prix" sur un produit.</p>
                      )}
                      {priceTrackingQuery.data?.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-white/5">
                          {item.productImageUrl && (
                            <img src={item.productImageUrl} alt={item.productName} className="w-8 h-8 rounded object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs line-clamp-1">{item.productName}</p>
                            {item.currentPrice && (
                              <p className="text-[#D4AF37] text-xs">{item.currentPrice} DT</p>
                            )}
                          </div>
                          <button
                            onClick={() => removePriceTrackingMutation.mutate({ id: item.id, sessionId })}
                            className="text-white/30 hover:text-red-400 text-xs px-1"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tabs */}
              <div className="flex bg-[#000] border-b border-white/10 px-2 gap-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCapturedImage(null);
                      analyzeImageMutation.reset();
                      multimodalMutation.reset();
                      voiceSearchMutation.reset();
                    }}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      activeTab === tab.id
                        ? "text-white border-b-2 border-[#D4AF37]"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 bg-[#000] overflow-y-auto">

                {/* ── Camera Tab ── */}
                {activeTab === "camera" && (
                  <div className="flex flex-col h-full">
                    {/* Viewfinder */}
                    <div className="relative bg-black" style={{ height: "220px" }}>
                      {capturedImage ? (
                        <img src={capturedImage} alt="captured" className="w-full h-full object-cover" />
                      ) : (
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                      )}
                      {!capturedImage && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="relative w-44 h-44">
                            {[["top-0 left-0", "border-t-2 border-l-2"], ["top-0 right-0", "border-t-2 border-r-2"], ["bottom-0 left-0", "border-b-2 border-l-2"], ["bottom-0 right-0", "border-b-2 border-r-2"]].map(([pos, border], i) => (
                              <div key={i} className={`absolute ${pos} w-6 h-6 ${border} border-[#D4AF37] rounded-sm`} />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {!capturedImage && (
                          <button
                            onClick={toggleFlash}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${flashOn ? "bg-[#D4AF37] text-black" : "bg-black/60 text-white"}`}
                          >⚡</button>
                        )}
                        {capturedImage && (
                          <button
                            onClick={() => { setCapturedImage(null); analyzeImageMutation.reset(); multimodalMutation.reset(); startCamera(); }}
                            className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center"
                          >🔄</button>
                        )}
                      </div>
                    </div>

                    {/* Multimodal text input */}
                    {!capturedImage && (
                      <div className="px-4 py-2 bg-[#000]">
                        <input
                          type="text"
                          value={multimodalTextQuery}
                          onChange={(e) => setMultimodalTextQuery(e.target.value)}
                          placeholder="Ajouter une description (optionnel)..."
                          className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#D4AF37]/40"
                        />
                      </div>
                    )}

                    {/* Capture button */}
                    {!capturedImage && (
                      <div className="flex justify-center py-3 bg-[#000]">
                        <button
                          onClick={capturePhoto}
                          className="w-14 h-14 rounded-full border-4 border-white/30 bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-white" />
                        </button>
                      </div>
                    )}

                    {/* Results */}
                    <div className="flex-1 px-4 pb-4">
                      {isAnalyzing && (
                        <div className="space-y-3 mt-2">
                          <div className="flex items-center gap-2 text-[#D4AF37] text-sm py-2">
                            <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                            Analyse {multimodalTextQuery ? "multimodale" : ""} en cours...
                          </div>
                          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                        </div>
                      )}
                      {analysisResult && (
                        <>
                          <AnalysisBadge analysis={{ ...analysisResult.analysis, estimatedPrice: analysisResult.analysis.estimatedPrice ?? null, similarityScore: (analysisResult.analysis as any).similarityScore }} />
                          {analysisResult.results.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-white/40 text-xs mb-2">{analysisResult.results.length} produits trouvés</p>
                              {(analysisResult.results as Product[]).map((p) => (
                                <ProductCard key={p.id} product={p} sessionId={sessionId} onTrackPrice={handleTrackPrice} onArTryOn={setArTryOnProduct} />
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm text-center py-6">Aucun produit similaire trouvé</p>
                          )}
                        </>
                      )}
                      {analysisError && (
                        <p className="text-red-400 text-sm text-center py-4">Erreur d'analyse. Réessayez.</p>
                      )}
                      {!capturedImage && !isAnalyzing && !analysisResult && trendingQuery.data && (
                        <>
                          <p className="text-white/40 text-xs mb-3 mt-2">🔥 Tendances</p>
                          <div className="space-y-2">
                            {(trendingQuery.data as Product[]).map((p) => (
                              <ProductCard key={p.id} product={p} sessionId={sessionId} onTrackPrice={handleTrackPrice} onArTryOn={setArTryOnProduct} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Gallery Tab ── */}
                {activeTab === "gallery" && (
                  <div className="flex flex-col px-4 py-4 gap-4">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />

                    {/* Multimodal text input */}
                    <div>
                      <p className="text-white/40 text-xs mb-1.5">Recherche multimodale — image + texte</p>
                      <input
                        type="text"
                        value={multimodalTextQuery}
                        onChange={(e) => setMultimodalTextQuery(e.target.value)}
                        placeholder="Description optionnelle..."
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#D4AF37]/40"
                      />
                    </div>

                    {!capturedImage ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-36 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 text-white/50 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]/70 transition-colors"
                      >
                        <span className="text-4xl">🖼️</span>
                        <span className="text-sm">Choisir une image</span>
                      </button>
                    ) : (
                      <div className="relative">
                        <img src={capturedImage} alt="selected" className="w-full h-48 object-cover rounded-2xl" />
                        <button
                          onClick={() => { setCapturedImage(null); analyzeImageMutation.reset(); multimodalMutation.reset(); }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center"
                        >✕</button>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[#D4AF37] text-sm">
                          <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                          Analyse {multimodalTextQuery ? "multimodale" : ""} en cours...
                        </div>
                        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                      </div>
                    )}
                    {analysisResult && (
                      <>
                        <AnalysisBadge analysis={{ ...analysisResult.analysis, estimatedPrice: analysisResult.analysis.estimatedPrice ?? null, similarityScore: (analysisResult.analysis as any).similarityScore }} />
                        <div className="space-y-2">
                          {(analysisResult.results as Product[]).map((p) => (
                            <ProductCard key={p.id} product={p} sessionId={sessionId} onTrackPrice={handleTrackPrice} onArTryOn={setArTryOnProduct} />
                          ))}
                        </div>
                      </>
                    )}
                    {!capturedImage && !isAnalyzing && trendingQuery.data && (
                      <>
                        <p className="text-white/40 text-xs">🔥 Tendances</p>
                        <div className="space-y-2">
                          {(trendingQuery.data as Product[]).map((p) => (
                            <ProductCard key={p.id} product={p} sessionId={sessionId} onTrackPrice={handleTrackPrice} onArTryOn={setArTryOnProduct} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── Text Tab ── */}
                {activeTab === "text" && (
                  <div className="flex flex-col px-4 py-4 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={textQuery}
                        onChange={(e) => setTextQuery(e.target.value)}
                        placeholder="Rechercher un produit..."
                        className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D4AF37]/50 pr-10"
                        autoFocus
                      />
                      {textQuery && (
                        <button
                          onClick={() => { setTextQuery(""); setDebouncedQuery(""); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                        >✕</button>
                      )}
                    </div>

                    {isLoading && (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                      </div>
                    )}
                    {!isLoading && debouncedQuery.length >= 2 && textSearchQuery.data && (
                      <div className="space-y-2">
                        <p className="text-white/40 text-xs">{textSearchQuery.data.results.length} résultats pour "{debouncedQuery}"</p>
                        {textSearchQuery.data.results.length === 0 ? (
                          <p className="text-white/40 text-sm text-center py-6">Aucun produit trouvé</p>
                        ) : (
                          (textSearchQuery.data.results as Product[]).map((p) => (
                            <ProductCard key={p.id} product={p} sessionId={sessionId} onTrackPrice={handleTrackPrice} onArTryOn={setArTryOnProduct} />
                          ))
                        )}
                      </div>
                    )}
                    {!isLoading && debouncedQuery.length < 2 && trendingQuery.data && (
                      <>
                        <p className="text-white/40 text-xs">🔥 Tendances</p>
                        <div className="space-y-2">
                          {(trendingQuery.data as Product[]).map((p) => (
                            <ProductCard key={p.id} product={p} sessionId={sessionId} onTrackPrice={handleTrackPrice} onArTryOn={setArTryOnProduct} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── Voice Tab ── */}
                {activeTab === "voice" && (
                  <div className="flex flex-col items-center px-4 py-8 gap-6">
                    {/* Microphone button */}
                    <div className="relative">
                      <motion.button
                        onClick={isRecording ? stopRecording : startRecording}
                        animate={isRecording ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                        transition={isRecording ? { repeat: Infinity, duration: 1.2 } : {}}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
                          isRecording
                            ? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                            : "bg-[#111] border-2 border-white/20 hover:border-[#D4AF37]/50"
                        }`}
                      >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={isRecording ? "text-white" : "text-white/60"}>
                          <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" y1="19" x2="12" y2="23"/>
                          <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      </motion.button>
                      {isRecording && (
                        <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-30" />
                      )}
                    </div>

                    <p className="text-white/60 text-sm text-center">
                      {isRecording
                        ? "Enregistrement en cours... Appuyez pour arrêter"
                        : "Appuyez pour rechercher par voix"}
                    </p>

                    {voiceSearchMutation.isPending && (
                      <div className="flex items-center gap-2 text-[#D4AF37] text-sm">
                        <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                        Transcription en cours...
                      </div>
                    )}

                    {voiceQuery && (
                      <div className="w-full bg-[#111] rounded-xl p-3 border border-white/10">
                        <p className="text-white/40 text-xs mb-1">Vous avez dit:</p>
                        <p className="text-white text-sm">"{voiceQuery}"</p>
                      </div>
                    )}

                    {voiceResults.length > 0 && (
                      <div className="w-full space-y-2">
                        <p className="text-white/40 text-xs">{voiceResults.length} résultats</p>
                        {(voiceResults as Product[]).map((p) => (
                          <ProductCard key={p.id} product={p} sessionId={sessionId} onTrackPrice={handleTrackPrice} onArTryOn={setArTryOnProduct} />
                        ))}
                      </div>
                    )}

                    {!isRecording && voiceResults.length === 0 && !voiceSearchMutation.isPending && trendingQuery.data && (
                      <>
                        <p className="text-white/40 text-xs self-start">🔥 Tendances</p>
                        <div className="w-full space-y-2">
                          {(trendingQuery.data as Product[]).map((p) => (
                            <ProductCard key={p.id} product={p} sessionId={sessionId} onTrackPrice={handleTrackPrice} onArTryOn={setArTryOnProduct} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Hidden canvas for photo capture */}
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AR Try-On Modal */}
      <AnimatePresence>
        {arTryOnProduct && (
          <ArTryOnModal
            product={arTryOnProduct}
            sessionId={sessionId}
            onClose={() => setArTryOnProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Price Tracking Toast */}
      <AnimatePresence>
        {toastMessage && (
          <PriceTrackingToast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
