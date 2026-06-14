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

type Tab = "camera" | "gallery" | "text";

// ─── Platform badge colors ────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  shein: "#FF6B9D",
  aliexpress: "#FF4500",
  temu: "#FF6600",
  local: "#D4AF37",
};

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const discount = product.discount ?? 0;
  const platform = product.platform ?? "local";
  const platformColor = PLATFORM_COLORS[platform] ?? "#D4AF37";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 bg-[#111] rounded-xl p-3 border border-white/5 active:scale-[0.98] transition-transform cursor-pointer"
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
  analysis: { productType: string; colors: string[]; keywords: string[]; confidence: number; platform: string | null; estimatedPrice: number | null };
}) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider">Lens AI✦</span>
        <span className="text-white/40 text-xs">
          {Math.round(analysis.confidence * 100)}% confiance
        </span>
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

// ─── Main LensSheet Component ─────────────────────────────────────────────────
export default function LensSheet({ isOpen, onClose }: LensSheetProps) {
  const [activeTab, setActiveTab] = useState<Tab>("camera");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sessionId] = useState(() => `lens-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── tRPC hooks ──────────────────────────────────────────────────────────
  const analyzeImageMutation = trpc.lens.analyzeImage.useMutation();
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

  // Toggle flash
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

  // Capture photo from camera
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
    analyzeImageMutation.mutate({ imageBase64: dataUrl, sessionId });
  }, [stopCamera, analyzeImageMutation, sessionId]);

  // Handle gallery file pick
  const handleFilePick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      analyzeImageMutation.mutate({ imageBase64: dataUrl, sessionId });
    };
    reader.readAsDataURL(file);
  }, [analyzeImageMutation, sessionId]);

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
      analyzeImageMutation.reset();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Derived state ───────────────────────────────────────────────────────
  const isAnalyzing = analyzeImageMutation.isPending;
  const analysisResult = analyzeImageMutation.data;
  const analysisError = analyzeImageMutation.error;

  const displayProducts: Product[] =
    activeTab === "camera" || activeTab === "gallery"
      ? (analysisResult?.results ?? trendingQuery.data ?? []) as Product[]
      : (textSearchQuery.data?.results ?? trendingQuery.data ?? []) as Product[];

  const isLoading =
    isAnalyzing ||
    (activeTab === "text" && textSearchQuery.isFetching);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
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
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#000] border-b border-white/10 px-4 gap-1">
              {(["camera", "gallery", "text"] as Tab[]).map((tab) => {
                const labels = { camera: "📷 Caméra", gallery: "🖼️ Galerie", text: "🔍 Texte" };
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setCapturedImage(null); analyzeImageMutation.reset(); }}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                      activeTab === tab
                        ? "text-white border-b-2 border-[#D4AF37]"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 bg-[#000] overflow-y-auto">

              {/* ── Camera Tab ── */}
              {activeTab === "camera" && (
                <div className="flex flex-col h-full">
                  {/* Viewfinder */}
                  <div className="relative bg-black" style={{ height: "240px" }}>
                    {capturedImage ? (
                      <img src={capturedImage} alt="captured" className="w-full h-full object-cover" />
                    ) : (
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                    )}
                    {/* Corner brackets */}
                    {!capturedImage && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-48 h-48">
                          {[["top-0 left-0", "border-t-2 border-l-2"], ["top-0 right-0", "border-t-2 border-r-2"], ["bottom-0 left-0", "border-b-2 border-l-2"], ["bottom-0 right-0", "border-b-2 border-r-2"]].map(([pos, border], i) => (
                            <div key={i} className={`absolute ${pos} w-6 h-6 ${border} border-[#D4AF37] rounded-sm`} />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Flash + retake buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {!capturedImage && (
                        <button
                          onClick={toggleFlash}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${flashOn ? "bg-[#D4AF37] text-black" : "bg-black/60 text-white"}`}
                        >
                          ⚡
                        </button>
                      )}
                      {capturedImage && (
                        <button
                          onClick={() => { setCapturedImage(null); analyzeImageMutation.reset(); startCamera(); }}
                          className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center"
                        >
                          🔄
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Capture button */}
                  {!capturedImage && (
                    <div className="flex justify-center py-4 bg-[#000]">
                      <button
                        onClick={capturePhoto}
                        className="w-16 h-16 rounded-full border-4 border-white/30 bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
                      >
                        <div className="w-12 h-12 rounded-full bg-white" />
                      </button>
                    </div>
                  )}

                  {/* Results */}
                  <div className="flex-1 px-4 pb-4">
                    {isAnalyzing && (
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-2 text-[#D4AF37] text-sm py-2">
                          <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                          Analyse en cours...
                        </div>
                        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                      </div>
                    )}
                    {analysisResult && (
                      <>
                        <AnalysisBadge analysis={analysisResult.analysis} />
                        {analysisResult.results.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-white/40 text-xs mb-2">{analysisResult.results.length} produits trouvés</p>
                            {(analysisResult.results as Product[]).map((p) => <ProductCard key={p.id} product={p} />)}
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
                          {(trendingQuery.data as Product[]).map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── Gallery Tab ── */}
              {activeTab === "gallery" && (
                <div className="flex flex-col px-4 py-4 gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFilePick}
                  />
                  {!capturedImage ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 text-white/50 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]/70 transition-colors"
                    >
                      <span className="text-4xl">🖼️</span>
                      <span className="text-sm">Choisir une image</span>
                    </button>
                  ) : (
                    <div className="relative">
                      <img src={capturedImage} alt="selected" className="w-full h-48 object-cover rounded-2xl" />
                      <button
                        onClick={() => { setCapturedImage(null); analyzeImageMutation.reset(); }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#D4AF37] text-sm">
                        <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                        Analyse en cours...
                      </div>
                      {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                    </div>
                  )}
                  {analysisResult && (
                    <>
                      <AnalysisBadge analysis={analysisResult.analysis} />
                      <div className="space-y-2">
                        {(analysisResult.results as Product[]).map((p) => <ProductCard key={p.id} product={p} />)}
                      </div>
                    </>
                  )}
                  {!capturedImage && !isAnalyzing && trendingQuery.data && (
                    <>
                      <p className="text-white/40 text-xs">🔥 Tendances</p>
                      <div className="space-y-2">
                        {(trendingQuery.data as Product[]).map((p) => <ProductCard key={p.id} product={p} />)}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Text Tab ── */}
              {activeTab === "text" && (
                <div className="flex flex-col px-4 py-4 gap-4">
                  {/* Search input */}
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
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Results */}
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
                        (textSearchQuery.data.results as Product[]).map((p) => <ProductCard key={p.id} product={p} />)
                      )}
                    </div>
                  )}
                  {!isLoading && debouncedQuery.length < 2 && trendingQuery.data && (
                    <>
                      <p className="text-white/40 text-xs">🔥 Tendances</p>
                      <div className="space-y-2">
                        {(trendingQuery.data as Product[]).map((p) => <ProductCard key={p.id} product={p} />)}
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
  );
}
