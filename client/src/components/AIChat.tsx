import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Mic, StopCircle, Upload, File, MoreHorizontal, ChevronRight, ChevronLeft, MessageSquare, Trash2, AlertTriangle, RefreshCw, Home, Calculator } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

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

// ─── Bysis brand colors ──────────────────────────────────────────────────────
const BYSIS_DOTS = ['#E53E3E', '#F6A623', '#1A1A1A']; // red, orange, black

// ─── Typing indicator with Bysis multicolor dots ─────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-1.5 py-1 px-1">
      {BYSIS_DOTS.map((color, i) => (
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
        className="w-full py-3 bg-black text-white rounded-2xl text-[14px] font-semibold tracking-tight flex items-center justify-center gap-2"
        style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif" }}
      >
        🛒 عدّل كومند
      </motion.button>
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRecalculate}
          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-black rounded-2xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <RefreshCw size={14} />
          عاود احسبلي
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onHome}
          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-black rounded-2xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors"
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
      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 mt-2"
    >
      <p className="text-[14px] font-semibold text-black mb-1" style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif" }}>
        🔐 تسجيل الدخول مطلوب
      </p>
      <p className="text-[12px] text-gray-500 mb-3 leading-relaxed">
        باش تعدي كومند، لازم تسجل دخولك أولاً
      </p>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onLogin}
        className="w-full py-2.5 bg-black text-white rounded-xl text-[13px] font-semibold"
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

// Spring animation — same feel as Amazon Rufus
const springIn: Transition = { type: 'spring', stiffness: 380, damping: 38, mass: 0.8 };
const springOut: Transition = { type: 'spring', stiffness: 400, damping: 40, mass: 0.6 };
const SLIDE_VARIANTS = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: springIn },
  exit: { y: '100%', opacity: 0, transition: springOut },
};
const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.22 } },
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

      // Handle requireLogin from server
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

    // Order intent check — require login
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

    // Add typing indicator
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
            className="fixed inset-0 z-[9998] bg-black/30"
            onClick={onClose}
          />

          {/* Chat Panel — slides up from bottom, leaves bottom nav visible */}
          <motion.div
            key="chat-panel"
            variants={SLIDE_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed left-0 right-0 bottom-0 z-[9999] bg-white flex flex-col"
            style={{
              height: 'calc(100dvh - 64px)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-black" />
              </motion.button>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  {/* Bysis multicolor dots logo */}
                  <div className="flex gap-0.5">
                    {BYSIS_DOTS.map((color, i) => (
                      <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <span className="text-[15px] font-bold text-black tracking-tight">Bysis</span>
                  <span className="text-[15px] font-light text-gray-400">ai</span>
                </div>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase -mt-0.5">beta</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setView(view === 'settings' ? 'chat' : 'settings')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <MoreHorizontal size={20} className="text-black" />
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
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setView('chat')}
                    className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <ChevronLeft size={20} className="text-black" />
                  </motion.button>
                  <span className="text-[15px] font-semibold text-black">الإعدادات</span>
                </div>

                <div className="divide-y divide-gray-100">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('manage-history')}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} className="text-black" />
                      <span className="text-[14px] text-black">إدارة المحادثات</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setView('chat'); setMessages([]); }}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Home size={18} className="text-black" />
                      <span className="text-[14px] text-black">محادثة جديدة</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </motion.button>
                </div>

                <div className="px-5 py-6">
                  <p className="text-xs text-gray-400 text-center leading-relaxed">
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
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setView('settings')}
                    className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <ChevronLeft size={20} className="text-black" />
                  </motion.button>
                  <span className="text-[15px] font-semibold text-black">سجل المحادثات</span>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setConfirmClear(true)}
                    className="p-1.5 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </motion.button>
                </div>

                {confirmClear && (
                  <div className="mx-4 my-3 p-4 bg-red-50 rounded-2xl border border-red-100 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={16} className="text-red-500" />
                      <span className="text-[13px] font-semibold text-red-700">مسح كل المحادثات؟</span>
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
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-black text-[13px] font-medium rounded-xl transition-colors"
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
                    <div className="divide-y divide-gray-50">
                      {historyQuery.data.messages.map((msg, i) => (
                        <div key={i} className="px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[11px] font-semibold ${msg.role === 'user' ? 'text-black' : 'text-gray-500'}`}>
                              {msg.role === 'user' ? 'أنت' : 'Bysis AI'}
                            </span>
                            <span className="text-[10px] text-gray-300">
                              {new Date(msg.createdAt).toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[12px] text-gray-600 line-clamp-2 leading-relaxed">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                      <MessageSquare size={32} className="text-gray-200 mb-3" />
                      <p className="text-[13px] text-gray-400 text-center">لا يوجد سجل محادثات</p>
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
                    <p
                      className="text-[17px] font-bold text-black leading-snug"
                      style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
                    >
                      في أي مجال تحتاج مساعدة اليوم؟
                    </p>

                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        استكشف الخيارات
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                          <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSendMessage(q.text)}
                            className="flex-shrink-0 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[13px] text-gray-800 font-medium transition-colors"
                            style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
                          >
                            {q.emoji} {q.label}
                          </motion.button>
                        ))}
                      </div>

                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        طلبات شائعة
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {SUGGESTED_QUESTIONS.slice(3).map((q, i) => (
                          <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSendMessage(q.text)}
                            className="flex-shrink-0 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[13px] text-gray-800 font-medium transition-colors"
                            style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
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
                        className={`max-w-[82%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-black text-white rounded-br-sm'
                            : 'bg-gray-100 text-black rounded-bl-sm'
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
                                className="w-full rounded-xl mb-2 max-h-48 object-cover"
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
              <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-xl object-cover" />
                  <button
                    onClick={() => { setImagePreview(null); setImageBase64(null); }}
                    className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* File Preview */}
            {view === 'chat' && pendingFile && (
              <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
                  <File size={14} className="text-gray-600" />
                  <span className="text-xs text-gray-700 flex-1 truncate">{pendingFile.name}</span>
                  <button onClick={() => setPendingFile(null)} className="text-gray-400 hover:text-black text-lg leading-none">×</button>
                </div>
              </div>
            )}

            {/* ─── Input Area ──────────────────────────────────────────────── */}
            {view === 'chat' && (
              <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2.5">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => imageInputRef.current?.click()}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Upload size={18} className="text-gray-500" />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    <File size={18} className="text-gray-500" />
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
                    className="flex-1 bg-transparent text-[14px] text-black placeholder-gray-400 outline-none"
                    style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
                    disabled={isLoading}
                  />

                  {input.trim() || imageBase64 || pendingFile ? (
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleSendMessage(input)}
                      disabled={isLoading}
                      className="p-1.5 bg-black rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      <Send size={17} className="text-white" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-1.5 rounded-xl transition-colors flex-shrink-0 ${isRecording ? 'bg-red-100' : 'hover:bg-gray-200'}`}
                    >
                      {isRecording ? (
                        <div className="flex items-center gap-1">
                          <StopCircle size={17} className="text-red-600" />
                          <span className="text-xs text-red-600 font-mono">{recordingSeconds}s</span>
                        </div>
                      ) : (
                        <Mic size={17} className="text-gray-500" />
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            )}

            {/* Hidden file inputs */}
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
