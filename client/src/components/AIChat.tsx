import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, StopCircle, Upload, File, MoreHorizontal } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  fileName?: string;
  isTyping?: boolean;
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

const SUGGESTED_QUESTIONS = [
  { label: 'نحب نعدي كومند', text: 'نحب نعدي كومند', emoji: '🛒' },
  { label: 'احسبلي سعر', text: 'احسبلي سعر منتوج', emoji: '🧮' },
  { label: 'وقتاش الأريفاج؟', text: 'وقتاش الأريفاج القادم؟', emoji: '📦' },
  { label: 'وين كومندتي؟', text: 'نحب نتبع كومندتي', emoji: '🔍' },
  { label: 'كيفاش نخلص؟', text: 'كيفاش نخلص؟', emoji: '💳' },
  { label: 'شنوة bysis؟', text: 'شنوة bysis وكيفاش تخدم؟', emoji: 'ℹ️' },
];

// Slide up/down spring animation — same feel as Amazon Rufus
const springIn: Transition = { type: 'spring', stiffness: 380, damping: 38, mass: 0.8 };
const springOut: Transition = { type: 'spring', stiffness: 400, damping: 40, mass: 0.6 };

const SLIDE_VARIANTS = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: springIn },
  exit: { y: '100%', opacity: 0, transition: springOut },
};

// Backdrop fade
const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.22 } },
};

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; base64: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [sessionId] = useState(getSessionId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.chatbot.sendMessage.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg?.isTyping) {
          updated[updated.length - 1] = {
            role: 'assistant',
            content: response.message,
            isTyping: false,
          };
        } else {
          updated.push({ role: 'assistant', content: response.message });
        }
        return updated;
      });
      setIsLoading(false);
      setImageBase64(null);
      setImagePreview(null);
      setPendingFile(null);
    },
    onError: (error) => {
      toast.error('حدث خطأ: ' + (error.message || 'حاول مرة أخرى'));
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
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

  const handleSendMessage = async (
    content: string,
    audioBase64?: string | null,
    imageBase64Param?: string | null,
    fileBase64Param?: string | null
  ) => {
    if (!content.trim() && !audioBase64 && !imageBase64Param && !fileBase64Param) return;

    const userContent = content || (audioBase64 ? '[رسالة صوتية]' : '');
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
    });
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
              height: 'calc(100dvh - 64px)', // leave room for bottom nav
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={22} className="text-black" />
              </motion.button>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <img
                    src="/manus-storage/BlackandWhiteMinimalistSimpleModernTechnologyAILogo_7e8b089f.png"
                    alt="Bysis AI"
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-base font-bold text-black tracking-tight">Bysis</span>
                  <span className="text-base font-bold text-gray-400">ai</span>
                </div>
                <span className="text-[10px] text-gray-400 -mt-0.5">beta</span>
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <MoreHorizontal size={22} className="text-black" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="flex flex-col gap-5 pt-2"
                >
                  <p className="text-[15px] font-semibold text-black">
                    في أي مجال تحتاج مساعدة اليوم؟
                  </p>

                  {/* Suggestion chips — horizontal scroll rows */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      استكشف الخيارات
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSendMessage(q.text)}
                          className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-800 font-medium transition-colors border border-gray-200"
                        >
                          {q.emoji} {q.label}
                        </motion.button>
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      طلبات شائعة
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {SUGGESTED_QUESTIONS.slice(3).map((q, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSendMessage(q.text)}
                          className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-800 font-medium transition-colors border border-gray-200"
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
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-black text-white rounded-br-sm'
                          : 'bg-gray-100 text-black rounded-bl-sm'
                      }`}
                    >
                      {msg.isTyping ? (
                        <div className="flex gap-1.5 py-1">
                          {[0, 0.15, 0.3].map((delay, j) => (
                            <motion.div
                              key={j}
                              className="w-2 h-2 rounded-full bg-gray-400"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.7, delay }}
                            />
                          ))}
                        </div>
                      ) : (
                        <>
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="uploaded"
                              className="w-full rounded-xl mb-2 max-h-48 object-cover"
                            />
                          )}
                          <Streamdown>{msg.content}</Streamdown>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-xl object-cover" />
                  <button
                    onClick={() => { setImagePreview(null); setImageBase64(null); }}
                    className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* File Preview */}
            {pendingFile && (
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
                  <File size={14} className="text-gray-600" />
                  <span className="text-xs text-gray-700 flex-1 truncate">{pendingFile.name}</span>
                  <button onClick={() => setPendingFile(null)} className="text-gray-400 hover:text-black">×</button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2">
                {/* Media buttons */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => imageInputRef.current?.click()}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Upload size={18} className="text-gray-500" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <File size={18} className="text-gray-500" />
                </motion.button>

                {/* Text input */}
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
                  className="flex-1 bg-transparent text-sm text-black placeholder-gray-400 outline-none"
                  disabled={isLoading}
                />

                {/* Mic / Send */}
                {input.trim() || imageBase64 || pendingFile ? (
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleSendMessage(input)}
                    disabled={isLoading}
                    className="p-1.5 bg-black rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send size={18} className="text-white" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isRecording ? 'bg-red-100' : 'hover:bg-gray-200'
                    }`}
                  >
                    {isRecording ? (
                      <div className="flex items-center gap-1">
                        <StopCircle size={18} className="text-red-600" />
                        <span className="text-xs text-red-600 font-mono">{recordingSeconds}s</span>
                      </div>
                    ) : (
                      <Mic size={18} className="text-gray-500" />
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Hidden file inputs */}
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
