import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Mic, StopCircle, Upload, File, MoreHorizontal, ChevronRight, ChevronLeft, MessageSquare, Trash2, AlertTriangle, RefreshCw, Home, Loader2 } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import AnimatedAIOrb from './AnimatedAIOrb';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  fileName?: string;
  isTyping?: boolean;
  isPriceResult?: boolean;
  requireLogin?: boolean;
};

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

function getSessionId(): string {
  const key = 'bysis_chat_session';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// ─── Neon Typing Indicator ──────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-1.5 py-1 px-1">
      {[
        'rgba(236, 72, 153, 1)',   // pink
        'rgba(168, 85, 247, 1)',   // purple
        'rgba(59, 130, 246, 1)',   // blue
      ].map((color, i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ y: [0, -6, 0], scale: [1, 1.15, 1] }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Price Action Buttons ─────────────────────────────────────────────────────
function PriceActionButtons({
  onOrder,
  onRecalculate,
  onHome,
}: {
  onOrder: () => void;
  onRecalculate: () => void;
  onHome: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.25 }}
      className="flex flex-col gap-2 mt-3"
    >
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onOrder}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl text-[14px] font-semibold tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-pink-500/40"
        style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif" }}
      >
        🛒 عدي كومند
      </motion.button>
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRecalculate}
          className="flex-1 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-2xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors border border-purple-500/30"
        >
          <RefreshCw size={14} />
          عاود احسبلي
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onHome}
          className="flex-1 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-2xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors border border-blue-500/30"
        >
          <Home size={14} />
          القائمة الرئيسية
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Login Gate Card ──────────────────────────────────────────────────────────
function LoginGateCard({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-2xl p-4 border border-purple-500/30 mt-2 backdrop-blur-md"
    >
      <p className="text-[14px] font-semibold text-purple-200 mb-1" style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif" }}>
        🔐 تسجيل الدخول مطلوب
      </p>
      <p className="text-[12px] text-purple-300/70 mb-3 leading-relaxed">
        باش تعدي كومند، لازم تسجل دخولك أولاً
      </p>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onLogin}
        className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-[13px] font-semibold shadow-lg shadow-purple-500/30"
      >
        سجل دخولك الآن
      </motion.button>
    </motion.div>
  );
}

const SUGGESTED_QUESTIONS = [
  { label: 'نحب نعدي كومند', text: 'نحب نعدي كومند', emoji: '🛒' },
  { label: 'احسبلي سعر', text: 'احسبلي سعر منتوج', emoji: '🧮' },
  { label: 'وقتاش الأريفاج؟', text: 'وقتاش الأريفاج القادم؟', emoji: '📦' },
  { label: 'وين كومندتي؟', text: 'نحب نتبع كومندتي', emoji: '🔍' },
  { label: 'كيفاش نخلص؟', text: 'كيفاش نخلص؟', emoji: '💳' },
  { label: 'شنوة bysis؟', text: 'شنوة bysis وكيفاش تخدم؟', emoji: 'ℹ️' },
];

// Spring animation
// Smooth linear ease-out like Rufus AI — no spring bounce
const easeOut = [0.23, 1, 0.32, 1] as const;
const easeIn  = [0.55, 0, 1, 0.45] as const;
const SLIDE_VARIANTS = {
  hidden: { y: '100%', opacity: 1 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.32, ease: easeOut },
  },
  exit: {
    y: '100%',
    opacity: 1,
    transition: { duration: 0.26, ease: easeIn },
  },
};
const BACKDROP_VARIANTS = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.20 } },
};

type ChatView = 'chat' | 'settings' | 'manage-history';

// Detect if last assistant message is a price result
function isPriceMessage(content: string): boolean {
  return content.includes('💰 السعر النهائي') || content.includes('السعر النهائي:');
}

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<ChatView>('chat');
  const [confirmClear, setConfirmClear] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; base64: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [sessionId] = useState(getSessionId);
  const [showLoginGate, setShowLoginGate] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // History queries
  const historyQuery = trpc.chatbot.getMyHistory.useQuery(
    { sessionId },
    { enabled: view === 'manage-history' }
  );
  const clearHistoryMutation = trpc.chatbot.clearMyHistory.useMutation({
    onSuccess: () => {
      setMessages([]);
      historyQuery.refetch();
      setConfirmClear(false);
      toast.success('تم مسح سجل المحادثات');
    },
    onError: () => toast.error('حدث خطأ أثناء المسح'),
  });

  const chatMutation = trpc.chatbot.sendMessage.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => {
        const updated = prev.filter((m) => !m.isTyping);
        const isPrice = isPriceMessage(response.message);
        updated.push({
          role: 'assistant',
          content: response.message,
          isPriceResult: isPrice,
        });
        return updated;
      });
      setIsLoading(false);
      setImageBase64(null);
      setImagePreview(null);
      setPendingFile(null);

      if ((response as any).requireLogin) {
        setShowLoginGate(true);
      }
    },
    onError: (error) => {
      setMessages((prev) => prev.filter((m) => !m.isTyping));
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'معذرة، ما نجمتش نجاوبك. جرب مرة أخرى 🙏',
      }]);
      toast.error('حدث خطأ: ' + (error.message || 'حاول مرة أخرى'));
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setView('chat');
      setShowLoginGate(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPendingFile({ name: file.name, base64 });
      toast.success(`ملف "${file.name}" جاهز للإرسال`);
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (ev) => audioChunksRef.current.push(ev.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target?.result as string;
          handleSendMessage(input, base64, null, null);
        };
        reader.readAsDataURL(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      toast.error('لا يمكن الوصول للميكروفون');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleSendMessage = useCallback(async (
    content: string,
    audioBase64?: string | null,
    imageBase64Param?: string | null,
    fileBase64Param?: string | null
  ) => {
    if (!content.trim() && !audioBase64 && !imageBase64Param && !imageBase64 && !fileBase64Param && !pendingFile) return;
    if (isLoading) return;

    const orderKeywords = ['نحب نعدي كومند', 'عدي كومند', 'commande', 'order'];
    const isOrderIntent = orderKeywords.some(k => content.toLowerCase().includes(k.toLowerCase()));
    if (isOrderIntent && !isAuthenticated) {
      setShowLoginGate(true);
      return;
    }

    const userContent = content || (audioBase64 ? '[رسالة صوتية 🎤]' : (imageBase64Param || imageBase64 ? '[صورة 📷]' : '[ملف 📎]'));
    const userMessage: Message = {
      role: 'user',
      content: userContent,
      imageUrl: imagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setImageBase64(null);
    setImagePreview(null);
    setIsLoading(true);
    setShowLoginGate(false);

    setMessages((prev) => [...prev, { role: 'assistant', content: '', isTyping: true }]);

    const msgArray = [...messages, userMessage];
    chatMutation.mutate({
      sessionId,
      messages: msgArray.map((m) => ({ role: m.role, content: m.content })),
      imageBase64: imageBase64Param || imageBase64 || undefined,
      audioBase64: audioBase64 || undefined,
      fileBase64: fileBase64Param || pendingFile?.base64 || undefined,
      fileName: fileBase64Param ? 'file' : pendingFile?.name || undefined,
      isNewConversation: messages.length === 0,
      isLoggedIn: isAuthenticated,
      userId: user?.id?.toString() || undefined,
      userEmail: user?.email || undefined,
    });
  }, [messages, isLoading, isAuthenticated, user, imageBase64, imagePreview, pendingFile, sessionId, chatMutation]);

  const handleOrderAction = () => {
    if (!isAuthenticated) {
      setShowLoginGate(true);
      return;
    }
    handleSendMessage('نحب نعدي كومند');
  };

  const handleRecalculate = () => {
    handleSendMessage('عاود احسبلي سعر منتوج آخر');
  };

  const handleGoHome = () => {
    setMessages([]);
    setShowLoginGate(false);
  };

  const handleLogin = () => {
    const loginUrl = getLoginUrl();
    window.location.href = loginUrl;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={BACKDROP_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Chat Panel — Dark Futuristic Theme */}
          <motion.div
            key="chat-panel"
            variants={SLIDE_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed left-0 right-0 z-[9999] flex flex-col bg-gradient-to-br from-[#1a0f2e] via-[#2d1b3d] to-[#0f0a1a]"
            style={{
              bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
              height: 'calc(100dvh - 64px - env(safe-area-inset-bottom, 0px))',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: '0 -8px 40px rgba(168, 85, 247, 0.3)',
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-md">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={20} className="text-white/70 hover:text-white" strokeWidth={1.5} />
              </motion.button>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <AnimatedAIOrb isThinking={false} isListening={false} size="sm" />
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Bysis AI
                    </h3>
                    <p className="text-xs text-purple-300/60">Assistant Intelligent</p>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setView(view === 'settings' ? 'chat' : 'settings')}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <MoreHorizontal size={20} className="text-white/70 hover:text-white" strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Settings Panel */}
            {view === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.22 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setView('chat')}
                    className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <ChevronLeft size={20} className="text-white/70" strokeWidth={1.5} />
                  </motion.button>
                  <span className="text-[15px] font-semibold text-white">الإعدادات</span>
                </div>

                <div className="divide-y divide-white/10">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('manage-history')}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} className="text-purple-400" strokeWidth={1.5} />
                      <span className="text-[14px] text-white">إدارة المحادثات</span>
                    </div>
                    <ChevronRight size={18} className="text-white/30" strokeWidth={1.5} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setView('chat'); setMessages([]); }}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Home size={18} className="text-pink-400" strokeWidth={1.5} />
                      <span className="text-[14px] text-white">محادثة جديدة</span>
                    </div>
                    <ChevronRight size={18} className="text-white/30" strokeWidth={1.5} />
                  </motion.button>
                </div>

                <div className="px-5 py-6">
                  <p className="text-xs text-white/40 text-center leading-relaxed">
                    Bysis AI قد يرتكب أخطاء. تحقق من المعلومات المهمة.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Manage History Panel */}
            {view === 'manage-history' && (
              <motion.div
                key="manage-history"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.22 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setView('settings')}
                    className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <ChevronLeft size={20} className="text-white/70" strokeWidth={1.5} />
                  </motion.button>
                  <span className="text-[15px] font-semibold text-white">سجل المحادثات</span>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setConfirmClear(true)}
                    className="p-1.5 hover:bg-red-500/20 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} className="text-red-400" strokeWidth={1.5} />
                  </motion.button>
                </div>

                {confirmClear && (
                  <div className="mx-4 my-3 p-4 bg-red-500/20 rounded-2xl border border-red-500/30 flex-shrink-0 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={16} className="text-red-400" />
                      <span className="text-[13px] font-semibold text-red-300">مسح كل المحادثات؟</span>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => clearHistoryMutation.mutate({ sessionId })}
                        disabled={clearHistoryMutation.isPending}
                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium rounded-xl transition-colors disabled:opacity-60"
                      >
                        {clearHistoryMutation.isPending ? 'جاري المسح...' : 'تأكيد'}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setConfirmClear(false)}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium rounded-xl transition-colors border border-white/20"
                      >
                        إلغاء
                      </motion.button>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto">
                  {historyQuery.isLoading ? (
                    <div className="flex justify-center py-8">
                      <TypingDots />
                    </div>
                  ) : historyQuery.data && historyQuery.data.messages.length > 0 ? (
                    <div className="divide-y divide-white/10">
                      {historyQuery.data.messages.map((msg, i) => (
                        <div key={i} className="px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[11px] font-semibold ${msg.role === 'user' ? 'text-purple-300' : 'text-pink-300'}`}>
                              {msg.role === 'user' ? 'أنت' : 'Bysis AI'}
                            </span>
                            <span className="text-[10px] text-white/30">
                              {new Date(msg.createdAt).toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[12px] text-white/60 line-clamp-2 leading-relaxed">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                      <MessageSquare size={32} className="text-white/20 mb-3" />
                      <p className="text-[13px] text-white/40 text-center">لا يوجد سجل محادثات</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── Chat Area ──────────────────────────────────────────────────── */}
            {view === 'chat' && (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="flex flex-col gap-5 pt-2"
                  >
                    <p className="text-[17px] font-bold text-white leading-snug">
                      في أي مجال تحتاج مساعدة اليوم؟
                    </p>

                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold text-purple-300/60 uppercase tracking-widest">
                        استكشف الخيارات
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                          <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSendMessage(q.text)}
                            className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/10 hover:from-purple-500/30 hover:to-pink-500/20 rounded-full text-[13px] text-purple-200 font-medium transition-colors border border-purple-500/30"
                          >
                            {q.emoji} {q.label}
                          </motion.button>
                        ))}
                      </div>

                      <p className="text-[11px] font-semibold text-pink-300/60 uppercase tracking-widest">
                        طلبات شائعة
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {SUGGESTED_QUESTIONS.slice(3).map((q, i) => (
                          <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSendMessage(q.text)}
                            className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-pink-500/20 to-blue-500/10 hover:from-pink-500/30 hover:to-blue-500/20 rounded-full text-[13px] text-pink-200 font-medium transition-colors border border-pink-500/30"
                          >
                            {q.emoji} {q.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed backdrop-blur-md border ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-pink-500/90 to-purple-500/90 text-white rounded-br-sm border-white/20 shadow-lg shadow-pink-500/40'
                            : 'bg-gradient-to-br from-white/15 to-white/5 text-white rounded-bl-sm border-white/20 shadow-lg shadow-purple-500/20'
                        }`}
                        style={{ fontFamily: "'Inter', 'SF Pro Text', -apple-system, sans-serif" }}
                      >
                        {msg.isTyping ? (
                          <TypingDots />
                        ) : (
                          <>
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt="uploaded"
                                className="w-full rounded-xl mb-2 max-h-48 object-cover border border-white/20"
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                            <Streamdown>{msg.content}</Streamdown>

                            {/* Price action buttons after price result */}
                            {msg.isPriceResult && msg.role === 'assistant' && i === messages.length - 1 && (
                              <PriceActionButtons
                                onOrder={handleOrderAction}
                                onRecalculate={handleRecalculate}
                                onHome={handleGoHome}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Login gate card */}
                {showLoginGate && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[82%]">
                      <LoginGateCard onLogin={handleLogin} />
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Image Preview */}
            {view === 'chat' && imagePreview && (
              <div className="px-4 py-2 border-t border-white/10 flex-shrink-0">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-white/20" />
                  <button
                    onClick={() => { setImagePreview(null); setImageBase64(null); }}
                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* File Preview */}
            {view === 'chat' && pendingFile && (
              <div className="px-4 py-2 border-t border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-2 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                  <File size={14} className="text-purple-300" strokeWidth={1.5} />
                  <span className="text-xs text-purple-200 flex-1 truncate">{pendingFile.name}</span>
                  <button onClick={() => setPendingFile(null)} className="text-purple-300 hover:text-white text-lg leading-none">×</button>
                </div>
              </div>
            )}

            {/* ─── Input Area ──────────────────────────────────────────────── */}
            {view === 'chat' && (
              <div className="px-4 py-3 border-t border-white/10 bg-gradient-to-t from-purple-900/20 to-transparent flex-shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2.5 border border-white/20 backdrop-blur-sm">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => imageInputRef.current?.click()}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Upload size={18} className="text-purple-300" strokeWidth={1.5} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <File size={18} className="text-purple-300" strokeWidth={1.5} />
                  </motion.button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(input);
                      }
                    }}
                    placeholder="اسأل Bysis AI..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-[14px]"
                    style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
                  />

                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      isRecording
                        ? 'bg-red-500/30 text-red-300 hover:bg-red-500/40'
                        : 'hover:bg-white/10 text-purple-300'
                    }`}
                  >
                    {isRecording ? (
                      <StopCircle size={18} strokeWidth={1.5} />
                    ) : (
                      <Mic size={18} strokeWidth={1.5} />
                    )}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleSendMessage(input)}
                    disabled={isLoading || !input.trim()}
                    className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                      isLoading || !input.trim()
                        ? 'bg-purple-500/10 text-purple-500/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50 active:scale-95'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" strokeWidth={1.5} />
                    ) : (
                      <Send size={18} strokeWidth={1.5} />
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
