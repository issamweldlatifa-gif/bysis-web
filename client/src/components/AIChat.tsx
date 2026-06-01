import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, StopCircle, Upload, File } from 'lucide-react';
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

// Session ID persistence
function getSessionId(): string {
  const key = 'bysis_chat_session';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// Quick action questions
const SUGGESTED_QUESTIONS = [
  { label: 'نحب نعدي كومند', text: 'نحب نعدي كومند', emoji: '🛒' },
  { label: 'احسبلي سعر', text: 'احسبلي سعر منتوج', emoji: '🧮' },
  { label: 'وقتاش الأريفاج؟', text: 'وقتاش الأريفاج القادم؟', emoji: '📦' },
  { label: 'وين كومندتي؟', text: 'نحب نتبع كومندتي', emoji: '🔍' },
  { label: 'كيفاش نخلص؟', text: 'كيفاش نخلص؟', emoji: '💳' },
  { label: 'شنوة bysis؟', text: 'شنوة bysis وكيفاش تخدم؟', emoji: 'ℹ️' },
];

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

  // tRPC mutation for chat
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
          updated.push({
            role: 'assistant',
            content: response.message,
          });
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
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

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          handleSendMessage(input, base64, null, null);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (error) {
      toast.error('لا يمكن الوصول للميكروفون');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
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

    // Add typing indicator
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        isTyping: true,
      },
    ]);

    const msgArray = [
      ...messages,
      userMessage,
    ];

    chatMutation.mutate({
      sessionId,
      messages: msgArray.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      imageBase64: imageBase64Param || imageBase64 || undefined,
      audioBase64: audioBase64 || undefined,
      fileBase64: fileBase64Param || pendingFile?.base64 || undefined,
      fileName: fileBase64Param ? 'file' : pendingFile?.name || undefined,
      isNewConversation: messages.length === 0,
    });
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-black" />
            </motion.button>

            <div className="flex items-center gap-2">
              <img
                src="/manus-storage/BlackandWhiteMinimalistSimpleModernTechnologyAILogo_7e8b089f.png"
                alt="Bysis AI"
                className="w-5 h-5 object-contain"
              />
              <h2 className="text-lg font-semibold text-black">Bysis AI</h2>
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-xl text-black">⋯</span>
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-black mb-2">
                    في أي مجال تحتاج مساعدة؟
                  </h3>
                  <p className="text-sm text-gray-600">
                    اختر من الخيارات أسفله أو اسأل سؤالك
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSuggestedQuestion(q.text)}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm text-gray-700 transition-colors"
                      >
                        <div className="font-semibold">{q.emoji} {q.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-black text-white rounded-br-none'
                        : 'bg-gray-100 text-black rounded-bl-none'
                    }`}
                  >
                    {msg.isTyping ? (
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    ) : (
                      <>
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="uploaded" className="w-full rounded mb-2 max-h-48 object-cover" />
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
            <div className="px-4 py-2 border-t border-gray-200">
              <div className="relative inline-block">
                <img src={imagePreview} alt="preview" className="w-20 h-20 rounded object-cover" />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageBase64(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* File Preview */}
          {pendingFile && (
            <div className="px-4 py-2 border-t border-gray-200">
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                <File size={16} />
                <span className="text-sm text-gray-700 flex-1 truncate">{pendingFile.name}</span>
                <button
                  onClick={() => setPendingFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white space-y-2">
            {/* Media buttons */}
            <div className="flex gap-2 justify-start">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => imageInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="صورة"
              >
                <Upload size={20} className="text-gray-600" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="ملف"
              >
                <File size={20} className="text-gray-600" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording ? 'bg-red-100' : 'hover:bg-gray-100'
                }`}
                title="صوت"
              >
                {isRecording ? (
                  <div className="flex items-center gap-1">
                    <StopCircle size={20} className="text-red-600" />
                    <span className="text-xs text-red-600">{recordingSeconds}s</span>
                  </div>
                ) : (
                  <Mic size={20} className="text-gray-600" />
                )}
              </motion.button>
            </div>

            {/* Input field */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(input);
                  }
                }}
                placeholder="اكتب رسالتك..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder-gray-500"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || (!input.trim() && !imageBase64 && !pendingFile)}
                className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                <Send size={20} />
              </motion.button>
            </div>
          </div>

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

          {/* Safe area bottom */}
          <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
