import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Streamdown } from 'streamdown';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
  'Quels sont les derniers produits en stock ?',
  'Comment puis-je suivre ma commande ?',
  'Quelles sont les promotions actuelles ?',
  'Comment retourner un produit ?',
  'Quels sont les délais de livraison ?',
  'Comment contacter le support client ?',
];

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Integrate with LLM API
      // For now, just show a placeholder response
      setTimeout(() => {
        const assistantMessage: Message = {
          role: 'assistant',
          content: `Je suis Bysis AI. Voici ma réponse à: "${content}"\n\nComment puis-je vous aider davantage ?`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
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
                    Dans quel domaine avez-vous besoin d'aide aujourd'hui ?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Posez une question ou explorez les suggestions ci-dessous
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-black mb-2">
                      Explorer les options
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {SUGGESTED_QUESTIONS.slice(0, 2).map((q, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuggestedQuestion(q)}
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm text-gray-700 transition-colors"
                        >
                          {q}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-black mb-2">
                      Essayer quelque chose de nouveau
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {SUGGESTED_QUESTIONS.slice(2, 4).map((q, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuggestedQuestion(q)}
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm text-gray-700 transition-colors"
                        >
                          {q}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-black mb-2">
                      Obtenir des recommandations
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {SUGGESTED_QUESTIONS.slice(4, 6).map((q, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuggestedQuestion(q)}
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-sm text-gray-700 transition-colors"
                        >
                          {q}
                        </motion.button>
                      ))}
                    </div>
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
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                </motion.div>
              ))
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 p-3"
              >
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
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
                placeholder="Demandez à Bysis..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder-gray-500"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                <Send size={20} />
              </motion.button>
            </div>
          </div>

          {/* Safe area bottom */}
          <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
