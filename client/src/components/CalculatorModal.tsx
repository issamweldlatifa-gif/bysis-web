'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X as PhX, Camera, Upload, Sparkle, ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculationComplete?: (result: any) => void;
  onOrderNow?: () => void;
}

export default function CalculatorModal({ isOpen, onClose, onCalculationComplete, onOrderNow }: CalculatorModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLinePosition, setScanLinePosition] = useState(0);
  
  // Image filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanProgressRef = useRef<NodeJS.Timeout | null>(null);
  const scanLineRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const estimatedDurationRef = useRef<number>(3000);
  const streamRef = useRef<MediaStream | null>(null);

  const extractPrice = trpc.calculator.extractPrice.useMutation({
    onSuccess: (data: any) => {
      const duration = Date.now() - startTimeRef.current;
      estimatedDurationRef.current = Math.max(duration, 2000);
      setScanProgress(100);

      setTimeout(() => {
        setResult(data);
        setIsScanning(false);
        setScanProgress(0);
        setScanLinePosition(0);
        toast.success("✅ تم حساب السعر!");
        onCalculationComplete?.(data);
      }, 300);
    },
    onError: (error) => {
      setIsScanning(false);
      setScanProgress(0);
      setScanLinePosition(0);
      toast.error("❌ خطأ في استخراج السعر");
      console.error(error);
    },
  });

  const cleanupTimers = () => {
    if (scanProgressRef.current) clearInterval(scanProgressRef.current);
    if (scanLineRef.current) clearInterval(scanLineRef.current);
  };

  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, []);

  // Start camera on mount - keep it open continuously
  useEffect(() => {
    if (isOpen && cameraActive && !imagePreview) {
      startCamera();
    }
    return () => {
      // Only stop camera when modal closes completely
      if (!isOpen) {
        stopCamera();
      }
    };
  }, [isOpen, cameraActive, imagePreview]);

  const startCamera = async () => {
    try {
      // Reuse existing stream if available
      if (streamRef.current) {
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          setCameraActive(true);
        }
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          frameRate: { ideal: 30 } // Optimize frame rate
        },
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      toast.error("لا يمكن الوصول للكاميرا");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  const captureFromCamera = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(videoRef.current, 0, 0);
        
        const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
        setImagePreview(dataUrl);
        setImageBase64(dataUrl);
        triggerScanning(dataUrl);
      }
    }
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("الصورة كبيرة جداً (max 10MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      triggerScanning(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  const triggerScanning = (imageBase64: string) => {
    cleanupTimers();
    setIsScanning(true);
    setScanProgress(1);
    setScanLinePosition(0);
    startTimeRef.current = Date.now();

    // Animate scanning line
    let linePos = 0;
    scanLineRef.current = setInterval(() => {
      linePos = (linePos + 2) % 100;
      setScanLinePosition(linePos);
    }, 20);

    // Sync progress with estimated API duration
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(95, Math.floor((elapsed / estimatedDurationRef.current) * 95));
      setScanProgress(progress);
    }, 50);

    scanProgressRef.current = interval;

    setTimeout(() => {
      extractPrice.mutate({ imageBase64 });
    }, 300);
  };

  const handleReset = () => {
    cleanupTimers();
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setIsScanning(false);
    setScanProgress(0);
    setScanLinePosition(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    // Restart camera
    startCamera();
  };

  const handleClose = () => {
    cleanupTimers();
    stopCamera();
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setIsScanning(false);
    setScanProgress(0);
    setScanLinePosition(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkle className="text-cyan-400" size={24} weight="fill" />
                احسب السعر
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <PhX size={24} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {result ? (
                // Result View
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Image Preview */}
                  <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-black/50">
                    <img
                      src={imagePreview || ""}
                      alt="Product"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <CheckCircle size={16} weight="fill" />
                      {result.confidence}
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-cyan-400/70 text-sm font-medium mb-1">السعر الأصلي</p>
                      <p className="text-3xl font-bold text-white">{result.priceInEUR} EUR</p>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

                    <div className="text-center">
                      <p className="text-cyan-400/70 text-sm font-medium mb-1">السعر بالدينار</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {result.priceInTND}
                      </p>
                      <p className="text-cyan-400/60 text-xs mt-1">≈ {(result.priceInTND / 145).toFixed(2)}€</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(result.priceInTND + " دينار");
                        toast.success("تم النسخ!");
                      }}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl transition-all"
                    >
                      📋 نسخ السعر
                    </Button>
                    <Button
                      onClick={() => {
                        const text = `السعر: ${result.priceInTND} دينار (${(result.priceInTND / 145).toFixed(2)}€) من ${result.model || 'منتوج'}`;
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      💬 شارك على WhatsApp
                    </Button>
                    <Button
                      onClick={() => {
                        onOrderNow?.();
                        handleClose();
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      عديلي كومند
                      <ArrowRight size={18} />
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="w-full border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-semibold py-3 rounded-xl transition-all"
                    >
                      صورة أخرى
                    </Button>
                  </div>
                </motion.div>
              ) : (
                // Camera/Upload View
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Camera Feed */}
                  <div className="relative rounded-xl overflow-hidden bg-black border-2 border-cyan-500/30 aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {/* Scanning Line Animation */}
                    {isScanning && (
                      <motion.div
                        animate={{ top: `${scanLinePosition}%` }}
                        transition={{ duration: 0.02 }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-b from-green-400 via-green-500 to-transparent shadow-lg shadow-green-500/50"
                      />
                    )}

                    {/* Progress Overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-white font-bold text-2xl">{scanProgress}%</p>
                          <p className="text-cyan-400 text-sm">جاري الفحص...</p>
                        </div>
                        <div className="w-48 h-2 bg-black/50 rounded-full overflow-hidden border border-cyan-500/30">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${scanProgress}%` }}
                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Capture Button Overlay */}
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={captureFromCamera}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50 flex items-center justify-center hover:shadow-cyan-500/70 transition-all"
                        >
                          <Camera size={32} className="text-white" weight="fill" />
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Filter Controls */}
                  {!isScanning && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 bg-black/30 p-4 rounded-lg border border-cyan-500/10"
                    >
                      <div>
                        <label className="text-xs text-cyan-400 font-semibold">السطوع</label>
                        <Slider
                          value={[brightness]}
                          onValueChange={(v) => setBrightness(v[0])}
                          min={50}
                          max={150}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-cyan-400 font-semibold">التباين</label>
                        <Slider
                          value={[contrast]}
                          onValueChange={(v) => setContrast(v[0])}
                          min={50}
                          max={150}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-cyan-400 font-semibold">التشبع</label>
                        <Slider
                          value={[saturation]}
                          onValueChange={(v) => setSaturation(v[0])}
                          min={50}
                          max={150}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Upload Button */}
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload size={20} />
                    تحميل من الجاليري
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* History Link */}
                  <button className="w-full text-center text-cyan-400 hover:text-cyan-300 text-sm font-medium py-2 transition-colors">
                    📜 السجل التاريخي
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
