/**
 * AIChat.tsx — Manus-style Professional AI Chat Interface
 * Dark theme with glassmorphism, neon gradients, smooth animations
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  messageCount: number;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Welcome Message Component ──────────────────────────────────────────────
function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="mb-8">
        {/* Animated AI Orb */}
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-full opacity-75 blur-lg animate-pulse"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent mb-3">
          Assistant Bysis
        </h2>
        <p className="text-gray-400 text-sm font-light tracking-wide">
          Posez vos questions sur les produits
        </p>
      </div>

      {/* Suggested Actions */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-8">
        {[
          { icon: "💰", label: "Prix?" },
          { icon: "📦", label: "Disponible?" },
          { icon: "🖼️", label: "Meilleure image?" },
          { icon: "📋", label: "Détails?" },
        ].map((action) => (
          <button
            key={action.label}
            className="px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-purple-500/50 text-gray-300 hover:text-purple-300 text-xs font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <span className="mr-2">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Message Bubble Component ──────────────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fadeIn`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
          isUser
            ? "bg-gradient-to-br from-purple-600 to-blue-600 border-purple-400/50 text-white rounded-br-none"
            : "bg-white/5 border-white/10 text-gray-100 rounded-bl-none hover:bg-white/10"
        }`}
      >
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Message image"
            className="w-full rounded-lg mb-2 max-h-48 object-cover"
          />
        )}
        <div className="text-sm leading-relaxed">
          {isUser ? (
            message.content
          ) : (
            <Streamdown>{message.content}</Streamdown>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Conversation History ──────────────────────────────────────────
function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={onNew}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs">
            Aucune conversation
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  activeId === conv.id
                    ? "bg-gradient-to-r from-purple-600/50 to-blue-600/50 border border-purple-400/50"
                    : "hover:bg-white/5 border border-transparent"
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <p className="text-xs font-medium text-gray-200 truncate">
                  {conv.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(conv.timestamp).toLocaleDateString("fr-FR")}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-600/50 rounded"
                >
                  <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Chat Component ────────────────────────────────────────────────────
export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = trpc.chatbot.sendMessage.useMutation();

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bysis_conversations");
    if (saved) {
      try {
        const convs = JSON.parse(saved) as Conversation[];
        setConversations(convs);
        if (convs.length > 0) {
          setActiveConversationId(convs[0].id);
          const msgs = localStorage.getItem(`bysis_chat_${convs[0].id}`);
          if (msgs) setMessages(JSON.parse(msgs));
        }
      } catch (e) {
        console.error("Failed to load conversations:", e);
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save messages to localStorage
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      localStorage.setItem(`bysis_chat_${activeConversationId}`, JSON.stringify(messages));
    }
  }, [messages, activeConversationId]);

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() && messages.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue || "Bonjour",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendMessage.mutateAsync({
        messages: [{ role: "user", content: userMessage.content }],
        sessionId: activeConversationId,
        isNewConversation: messages.length === 0,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: typeof response === "string" ? response : (response as any).reply || "Désolé, une erreur est survenue.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update or create conversation
      if (messages.length === 0) {
        const newConv: Conversation = {
          id: activeConversationId,
          title: userMessage.content.slice(0, 30) + "...",
          timestamp: Date.now(),
          messageCount: 2,
        };
        setConversations((prevConvs) => [newConv, ...prevConvs]);
        localStorage.setItem("bysis_conversations", JSON.stringify([newConv, ...conversations]));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, messages, activeConversationId, sendMessage]);

  // Create new conversation
  const handleNewConversation = useCallback(() => {
    const newId = Date.now().toString();
    setActiveConversationId(newId);
    setMessages([]);
    setInputValue("");
  }, []);

  // Select conversation
  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    const msgs = localStorage.getItem(`bysis_chat_${id}`);
    setMessages(msgs ? JSON.parse(msgs) : []);
  }, []);

  // Delete conversation
  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prevConvs) => prevConvs.filter((c) => c.id !== id));
    localStorage.removeItem(`bysis_chat_${id}`);
    if (activeConversationId === id) {
      handleNewConversation();
    }
  }, [activeConversationId, handleNewConversation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Assistant IA
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-6 border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="flex gap-3 items-end">
            {/* File Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-purple-400"
              title="Télécharger une image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
            />

            {/* Input Field */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              placeholder="Posez une question..."
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 focus:border-purple-500/50 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 rounded-lg transition-all duration-300 transform hover:scale-105 text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5951061 3.34915502,10.7522035 3.50612381,10.7522035 L16.6915026,11.5376905 C16.6915026,11.5376905 17.1624089,11.5376905 17.1624089,12.0089827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
