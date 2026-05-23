import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  PaperPlaneTilt,
  Image as PhImage,
  X as PhX,
  ArrowsOut,
  ArrowsIn,
  Microphone,
  StopCircle,
  File as PhFile,
  ShoppingCart,
  Package,
  CurrencyDollar,
  Truck,
  Calculator,
  ChatCircleText,
  User,
  Sparkle,
  Star,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PushNotificationBanner from "./PushNotificationBanner";
import CalculatorModal from "./CalculatorModal";
import AuthGateModal from "./AuthGateModal";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  fileName?: string;
  isTyping?: boolean;
}

function getSessionId(): string {
  const key = "bysis_chat_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// ─── Animated AI Star Icon (new design) ──────────────────────────────────────
function SisiIcon({ size = 28, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      style={animated ? { animation: "sisi-pulse 3s ease-in-out infinite" } : {}}
    >
      <defs>
        <linearGradient id="sisi-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60C8FF" />
          <stop offset="50%" stopColor="#0070BA" />
          <stop offset="100%" stopColor="#003087" />
        </linearGradient>
        <linearGradient id="sisi-g2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#009CDE" />
          <stop offset="100%" stopColor="#0070BA" />
        </linearGradient>
        <filter id="sisi-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Main 4-point star */}
      <path
        d="M20 3 C20 3 22.5 12 29 20 C22.5 28 20 37 20 37 C20 37 17.5 28 11 20 C17.5 12 20 3 20 3Z"
        fill="url(#sisi-g1)"
        filter="url(#sisi-glow)"
      />
      {/* Horizontal star */}
      <path
        d="M3 20 C3 20 12 17.5 20 11 C28 17.5 37 20 37 20 C37 20 28 22.5 20 29 C12 22.5 3 20 3 20Z"
        fill="url(#sisi-g2)"
        opacity="0.7"
      />
      {/* Small accent star top-right */}
      <path
        d="M30 8 C30 8 31 11 33 13 C31 15 30 18 30 18 C30 18 29 15 27 13 C29 11 30 8 30 8Z"
        fill="#60C8FF"
        opacity="0.85"
      />
      {/* Small accent star bottom-left */}
      <path
        d="M10 22 C10 22 10.8 24.5 12.5 26 C10.8 27.5 10 30 10 30 C10 30 9.2 27.5 7.5 26 C9.2 24.5 10 22 10 22Z"
        fill="#009CDE"
        opacity="0.6"
      />
    </svg>
  );
}

// ─── Bot avatar ───────────────────────────────────────────────────────────────
function BotAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-11 w-11" : "h-8 w-8";
  const iconSize = size === "md" ? 24 : 17;
  return (
    <div
      className={`${dim} rounded-2xl flex items-center justify-center flex-shrink-0`}
      style={{
        background: "linear-gradient(135deg, #003087 0%, #0070BA 60%, #009CDE 100%)",
        boxShadow: "0 4px 14px rgba(0,112,186,0.35)",
      }}
    >
      <SisiIcon size={iconSize} />
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-end">
      <BotAvatar size="sm" />
      <div
        className="rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-3"
        style={{ background: "#FFFFFF", border: "1px solid #CBD2D9", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, #0070BA, #003087)",
                animation: `typing-orb 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <div className="relative w-14 h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(0,112,186,0.08)" }}>
          <div
            className="absolute inset-y-0 w-8 rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(0,112,186,0.45), transparent)",
              animation: "scan-line 1.2s ease-in-out infinite",
            }}
          />
        </div>
        <span className="text-xs" style={{ color: "#6C7378", fontFamily: "Inter,sans-serif" }}>سيسي تفكر...</span>
      </div>
    </div>
  );
}

// ─── Quick actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: ShoppingCart, label: "نحب نعدي كومند", text: "نحب نعدي كومند", color: "#0070BA", emoji: "🛒" },
  { icon: CurrencyDollar, label: "احسبلي سعر", text: "احسبلي سعر منتوج", color: "#00A651", emoji: "🧮" },
  { icon: Package, label: "وقتاش الأريفاج؟", text: "وقتاش الأريفاج القادم؟", color: "#F5A623", emoji: "📦" },
  { icon: Truck, label: "وين كومندتي؟", text: "نحب نتبع كومندتي", color: "#9B59B6", emoji: "🔍" },
  { icon: CurrencyDollar, label: "كيفاش نخلص؟", text: "كيفاش نخلص؟", color: "#E74C3C", emoji: "💳" },
  { icon: ChatCircleText, label: "شنوة bysis؟", text: "شنوة bysis وكيفاش تخدم؟", color: "#003087", emoji: "ℹ️" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FloatingChat({
  externalOpen,
  onExternalOpenChange,
}: {
  externalOpen?: boolean;
  onExternalOpenChange?: (v: boolean) => void;
} = {}) {
  const [, navigate] = useLocation();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = (v: boolean) => {
    setInternalOpen(v);
    onExternalOpenChange?.(v);
  };
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; base64: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [sessionId] = useState(getSessionId);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [lastOrderPhone] = useState<string | undefined>();
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { isAuthenticated } = useAuth();

  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendMessage = trpc.chatbot.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isTyping);
        return [...filtered, { role: "assistant", content: data.message }];
      });
      if (!isOpen) setUnreadCount((c) => c + 1);
      if (data.orderCreated) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "✅ **كومندتك تسجلت بنجاح!** سنتواصل معك قريباً لتأكيد التفاصيل وطريقة الدفع 🎉\n\nتقدر كمان تعدي كومند مباشرة من الموقع باش تجيب كود التتبع BSS متاعك فوراً 👇",
            },
          ]);
          setShowPushBanner(true);
        }, 600);
      }
    },
    onError: () => {
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isTyping);
        return [...filtered, { role: "assistant", content: "معذرة، صار مشكل تقني. جرب مرة أخرى 🙏" }];
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMessage.isPending]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setUnreadCount(0);
    }
  }, [isOpen]);

  const doSend = useCallback(
    (textOverride?: string, audioBase64?: string) => {
      const text = textOverride ?? input.trim();
      if (!text && !imageBase64 && !pendingFile && !audioBase64) return;
      if (sendMessage.isPending) return;
      // For order-related messages, require auth
      const orderKeywords = ["نحب نعدي كومند", "commande", "order"];
      const isOrderIntent = orderKeywords.some(k => (text || "").toLowerCase().includes(k.toLowerCase()));
      if (isOrderIntent && !isAuthenticated) {
        setShowAuthGate(true);
        return;
      }

      const userMsg: Message = {
        role: "user",
        content: audioBase64 ? "🎤 رسالة صوتية" : text || (imageBase64 ? "📷 صورة منتوج" : "📎 ملف"),
        imageUrl: imagePreview || undefined,
        fileName: pendingFile?.name,
      };
      const newMessages = [...messages, userMsg];
      setMessages([...newMessages, { role: "assistant", content: "", isTyping: true }]);

      sendMessage.mutate({
        sessionId,
        messages: newMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        imageBase64: imageBase64 || undefined,
        audioBase64: audioBase64 || undefined,
        fileBase64: pendingFile?.base64 || undefined,
        fileName: pendingFile?.name || undefined,
        isNewConversation: isFirstMessage,
      });

      setInput("");
      setImagePreview(null);
      setImageBase64(null);
      setPendingFile(null);
      setIsFirstMessage(false);
    },
    [input, imageBase64, imagePreview, pendingFile, messages, sendMessage, sessionId, isFirstMessage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSend();
  };

  const handleSuggestion = (text: string) => doSend(text);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("الصورة كبيرة برشا (max 5MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => { const r = reader.result as string; setImagePreview(r); setImageBase64(r); };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("الملف كبير برشا (max 10MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => setPendingFile({ name: file.name, base64: reader.result as string });
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => doSend(undefined, reader.result as string);
        reader.readAsDataURL(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error("ما نجمناش نوصلو للميكروفون. تحقق من الإذن.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const windowClass = isFullscreen
    ? "fixed inset-0 z-50 rounded-none"
    : "fixed bottom-24 right-4 z-50 w-[420px] max-w-[calc(100vw-1rem)] h-[600px] max-h-[calc(100vh-7rem)] rounded-2xl";

  return (
    <>
      <style>{`
        @keyframes typing-orb {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-7px); opacity: 1; }
        }
        @keyframes scan-line {
          0% { left: -60%; }
          100% { left: 120%; }
        }
        @keyframes chat-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,112,186,0.35), 0 4px 16px rgba(0,112,186,0.25); }
          50% { box-shadow: 0 0 0 10px rgba(0,112,186,0), 0 4px 16px rgba(0,112,186,0.20); }
        }
        @keyframes sisi-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 4px rgba(0,112,186,0.4)); }
          50% { transform: scale(1.08) rotate(6deg); filter: drop-shadow(0 0 8px rgba(0,156,222,0.6)); }
        }
        @keyframes header-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes welcome-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,166,81,0.4); }
          50% { box-shadow: 0 0 0 4px rgba(0,166,81,0); }
        }
      `}</style>

      {/* ── Floating button ──────────────────────────────────────────────── */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #003087 0%, #0070BA 60%, #009CDE 100%)",
            boxShadow: "0 4px 20px rgba(0,112,186,0.45)",
            animation: "chat-pulse 2.5s ease-in-out infinite",
          }}
        >
          <SisiIcon size={28} animated />
          {unreadCount > 0 && (
            <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: "#D0021B" }}>
              {unreadCount}
            </div>
          )}
        </motion.button>
      )}

      {/* ── Chat window ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {isFullscreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.94 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className={`${windowClass} overflow-hidden flex flex-col`}
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,112,186,0.15)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {/* ── Header ──────────────────────────────────────────── */}
              <div
                className="flex items-center justify-between px-5 py-4 flex-shrink-0 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #002060 0%, #003087 40%, #0070BA 80%, #009CDE 100%)",
                }}
              >
                {/* Shimmer effect */}
                <div
                  className="absolute top-0 bottom-0 w-20 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
                    animation: "header-shimmer 5s linear infinite",
                  }}
                />

                <div className="flex items-center gap-3">
                  <div style={{ animation: "sisi-pulse 4s ease-in-out infinite" }}>
                    <BotAvatar size="md" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-base" style={{ fontFamily: "Inter,sans-serif", letterSpacing: "-0.01em" }}>
                        سيسي
                      </p>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                        <Star size={9} weight="fill" style={{ color: "#FFD700" }} />
                        <span className="text-[10px] font-semibold text-white">AI</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: "badge-glow 2s ease-in-out infinite" }} />
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.70)", fontFamily: "Inter,sans-serif" }}>
                        متصلة · مساعدة bysis الذكية
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 rounded-xl text-white hover:bg-white/15 transition-colors"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 rounded-xl text-white hover:bg-white/15 transition-colors"
                    onClick={() => { setIsOpen(false); setIsFullscreen(false); }}
                  >
                    <PhX size={16} weight="bold" />
                  </Button>
                </div>
              </div>

              {/* ── Messages ────────────────────────────────────────── */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-4"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,112,186,0.2) transparent", background: "#F6F9FC" }}
              >
                {/* ── Welcome screen ── */}
                {messages.length === 0 && (
                  <div className="space-y-5">
                    {/* Hero welcome card */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      className="rounded-2xl overflow-hidden"
                      style={{ boxShadow: "0 4px 20px rgba(0,112,186,0.12)" }}
                    >
                      {/* Card header gradient */}
                      <div
                        className="px-5 pt-5 pb-4 flex items-start gap-3"
                        style={{ background: "linear-gradient(135deg, #002060 0%, #003087 50%, #0070BA 100%)" }}
                      >
                        <div style={{ animation: "welcome-float 3s ease-in-out infinite" }}>
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                            <SisiIcon size={28} animated />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-white text-base" style={{ fontFamily: "Inter,sans-serif" }}>
                              أهلاً! أنا سيسي 👋
                            </p>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,215,0,0.2)", border: "1px solid rgba(255,215,0,0.4)" }}>
                              <Sparkle size={9} weight="fill" style={{ color: "#FFD700" }} />
                              <span className="text-[9px] font-bold" style={{ color: "#FFD700" }}>AI</span>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.80)", fontFamily: "Inter,sans-serif" }}>
                            مساعدتك الذكية لـ <span className="font-bold text-white">bysis</span> — نعاونك تشري من Shein، AliExpress وTemu بسهولة 🛍️
                          </p>
                        </div>
                      </div>
                      {/* Card body */}
                      <div className="px-5 py-4" style={{ background: "#FFFFFF", borderTop: "1px solid rgba(0,112,186,0.08)" }}>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          {[
                            { emoji: "🛒", label: "طلبيات", sub: "Shein · AliExpress · Temu" },
                            { emoji: "🧮", label: "حساب أسعار", sub: "€ → دينار تونسي" },
                            { emoji: "📦", label: "تتبع كومند", sub: "حالة طلبيتك" },
                          ].map((f, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div className="text-xl">{f.emoji}</div>
                              <p className="text-xs font-bold" style={{ color: "#1D1D1D" }}>{f.label}</p>
                              <p className="text-[10px]" style={{ color: "#9DA3A6" }}>{f.sub}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    {/* Quick action chips */}
                    <div>
                      <p className="text-xs font-semibold mb-2.5 pl-1" style={{ color: "#6C7378" }}>اختار سؤال أو اكتبلي مباشرة:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {QUICK_ACTIONS.map((q, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.07, duration: 0.25 }}
                            onClick={() => {
                              if (q.text === "احسبلي سعر منتوج") {
                                setIsCalculatorModalOpen(true);
                              } else {
                                handleSuggestion(q.text);
                              }
                            }}
                            className="flex items-center gap-2.5 text-xs px-3 py-3 rounded-xl text-right font-semibold transition-all duration-150 active:scale-[0.96]"
                            style={{
                              background: "#FFFFFF",
                              border: "1.5px solid #E4E8EC",
                              color: "#1D1D1D",
                              fontFamily: "Inter, sans-serif",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = q.color;
                              e.currentTarget.style.background = "#F8FAFC";
                              e.currentTarget.style.boxShadow = `0 2px 8px ${q.color}22`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#E4E8EC";
                              e.currentTarget.style.background = "#FFFFFF";
                              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                            }}
                          >
                            <span className="text-base flex-shrink-0">{q.emoji}</span>
                            <span className="flex-1 text-right leading-tight">{q.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Order form CTA */}
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                      onClick={() => { setIsOpen(false); navigate("/order"); }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all duration-150 active:scale-[0.97]"
                      style={{
                        background: "linear-gradient(135deg, #003087, #0070BA)",
                        boxShadow: "0 4px 14px rgba(0,112,186,0.30)",
                      }}
                    >
                      <ShoppingCart size={17} weight="fill" />
                      عدي كومند مباشرة وجيب كود التتبع BSS
                    </motion.button>
                  </div>
                )}

                {/* ── Message list ── */}
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "items-end"}`}
                  >
                    {msg.role === "assistant" && !msg.isTyping && <BotAvatar size="sm" />}
                    {msg.role === "user" && (
                      <div className="h-8 w-8 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #0070BA, #003087)" }}>
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}

                    {msg.isTyping ? (
                      <TypingIndicator />
                    ) : (
                      <div
                        className={`rounded-2xl px-4 py-3 max-w-[78%] ${msg.role === "user" ? "rounded-tr-md" : "rounded-bl-md"}`}
                        style={
                          msg.role === "user"
                            ? {
                                background: "linear-gradient(135deg, #0070BA, #003087)",
                                color: "#FFFFFF",
                                fontFamily: "Inter, sans-serif",
                                boxShadow: "0 2px 8px rgba(0,112,186,0.25)",
                              }
                            : {
                                background: "#FFFFFF",
                                border: "1px solid #E4E8EC",
                                color: "#1D1D1D",
                                fontFamily: "Inter, sans-serif",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                              }
                        }
                      >
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="uploaded" className="w-full max-w-[200px] rounded-xl mb-2" />
                        )}
                        {msg.fileName && (
                          <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                            <PhFile size={14} />
                            <span>{msg.fileName}</span>
                          </div>
                        )}
                        <p
                          className="text-sm whitespace-pre-wrap leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\n/g, "<br/>"),
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}

                {sendMessage.isPending && !messages.some((m) => m.isTyping) && <TypingIndicator />}

                {showPushBanner && (
                  <div className="mt-2">
                    <PushNotificationBanner
                      customerPhone={lastOrderPhone}
                      sessionId={sessionId}
                      onDismiss={() => setShowPushBanner(false)}
                    />
                  </div>
                )}
              </div>

              {/* ── Image preview ────────────────────────────────────── */}
              {imagePreview && (
                <div className="px-4 py-2 flex items-center gap-3 flex-shrink-0"
                  style={{ borderTop: "1px solid #E4E8EC", background: "#F6F9FC" }}>
                  <img src={imagePreview} alt="preview" className="h-12 w-12 rounded-xl object-cover border border-[#CBD2D9]" />
                  <span className="text-xs flex-1" style={{ color: "#6C7378" }}>صورة جاهزة للإرسال</span>
                  <button onClick={() => { setImagePreview(null); setImageBase64(null); }} className="text-xs font-semibold" style={{ color: "#0070BA" }}>
                    حذف
                  </button>
                </div>
              )}

              {/* ── File preview ─────────────────────────────────────── */}
              {pendingFile && (
                <div className="px-4 py-2 flex items-center gap-3 flex-shrink-0"
                  style={{ borderTop: "1px solid #E4E8EC", background: "#F6F9FC" }}>
                  <PhFile size={20} className="flex-shrink-0" style={{ color: "#0070BA" }} />
                  <span className="text-xs flex-1 truncate" style={{ color: "#1D1D1D" }}>{pendingFile.name}</span>
                  <button onClick={() => setPendingFile(null)} className="text-xs font-semibold" style={{ color: "#0070BA" }}>
                    حذف
                  </button>
                </div>
              )}

              {/* ── Recording indicator ──────────────────────────────── */}
              {isRecording && (
                <div className="px-4 py-2 flex items-center gap-3 flex-shrink-0"
                  style={{ borderTop: "1px solid #E4E8EC", background: "#FFF5F5" }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#D0021B" }} />
                  <span className="text-xs font-semibold" style={{ color: "#D0021B" }}>جاري التسجيل... {recordingSeconds}s</span>
                  <button onClick={stopRecording} className="ml-auto text-xs font-medium flex items-center gap-1" style={{ color: "#6C7378" }}>
                    <StopCircle size={16} style={{ color: "#D0021B" }} />
                    إيقاف
                  </button>
                </div>
              )}

              {/* ── Input bar ────────────────────────────────────────── */}
              <div className="px-4 py-3.5 flex-shrink-0"
                style={{ borderTop: "1px solid #E4E8EC", background: "#FFFFFF" }}>
                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                  <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xlsx,.csv" onChange={handleFileUpload} className="hidden" />

                  {/* Upload buttons */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={sendMessage.isPending}
                      title="رفع صورة"
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-90 disabled:opacity-40"
                      style={{ background: "#EEF2F7", border: "1px solid #CBD2D9", color: "#0070BA" }}
                    >
                      <PhImage size={17} weight="duotone" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sendMessage.isPending}
                      title="رفع ملف"
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-90 disabled:opacity-40"
                      style={{ background: "#EEF2F7", border: "1px solid #CBD2D9", color: "#0070BA" }}
                    >
                      <PhFile size={17} weight="duotone" />
                    </button>
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={sendMessage.isPending}
                      title={isRecording ? "إيقاف التسجيل" : "رسالة صوتية"}
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-90 disabled:opacity-40"
                      style={{
                        background: isRecording ? "#FFF5F5" : "#EEF2F7",
                        border: isRecording ? "1px solid #D0021B" : "1px solid #CBD2D9",
                        color: isRecording ? "#D0021B" : "#0070BA",
                      }}
                    >
                      {isRecording ? <StopCircle size={17} weight="fill" /> : <Microphone size={17} weight="duotone" />}
                    </button>
                  </div>

                  {/* Text input */}
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isRecording ? "🔴 جاري التسجيل..." : "اكتب لسيسي..."}
                    disabled={sendMessage.isPending || isRecording}
                    dir="auto"
                    className="flex-1 h-10 px-4 text-sm rounded-xl outline-none transition-all duration-200"
                    style={{
                      background: "#F5F7FA",
                      border: "1.5px solid #CBD2D9",
                      color: "#1D1D1D",
                      fontFamily: "Inter, sans-serif",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#0070BA"; e.target.style.background = "#FFFFFF"; e.target.style.boxShadow = "0 0 0 3px rgba(0,112,186,0.10)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#CBD2D9"; e.target.style.background = "#F5F7FA"; e.target.style.boxShadow = "none"; }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } }}
                  />

                  {/* Send button */}
                  <button
                    type="submit"
                    disabled={sendMessage.isPending || (!input.trim() && !imageBase64 && !pendingFile)}
                    className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-90 disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg, #0070BA, #003087)",
                      boxShadow: "0 2px 8px rgba(0,112,186,0.30)",
                    }}
                  >
                    <PaperPlaneTilt size={18} weight="fill" className="text-white" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calculator modal */}
      <CalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
      />

      {/* Auth Gate Modal — shown when unauthenticated user tries to place an order via chat */}
      <AuthGateModal
        open={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        action="order"
        returnPath="/"
      />
    </>
  );
}
