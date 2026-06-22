import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import {
  ChatCircle,
  ArrowLeft,
  User,
  ShoppingCart,
  Clock,
  CaretRight,
} from "@phosphor-icons/react";
import { useLocation } from "wouter";

export default function AdminConversations() {
  const [, navigate] = useLocation();
  const { data: authCheck, isLoading: authLoading } = trpc.adminAuth.check.useQuery();

  useEffect(() => {
    if (!authLoading && authCheck && !authCheck.isAdmin) {
      navigate("/admin/login");
    }
  }, [authLoading, authCheck, navigate]);

  if (authLoading || !authCheck) {
    return (
      <div className="min-h-screen flex flex-col mesh-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" strokeWidth={1.5} />
        </main>
      </div>
    );
  }

  if (!authCheck.isAdmin) return null;

  return <ConversationsContent />;
}

function ConversationsContent() {
  const [, navigate] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  const { data: conversations, isLoading } = trpc.chatbot.listConversations.useQuery();
  const { data: messages, isLoading: messagesLoading } = trpc.chatbot.getMessages.useQuery(
    { conversationId: selectedConversation! },
    { enabled: selectedConversation !== null }
  );

  return (
    <div className="min-h-screen flex flex-col mesh-bg">
      <Navbar />

      <main className="flex-1 py-6 md:py-10">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 text-sm text-[#6C7378] hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Retour
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: "#1D1D1D" }}>
                <ChatCircle size={24} className="text-cyan-400" />
                Conversations clients
              </h1>
              <p className="text-sm text-[#9DA3A6]">
                {conversations?.length || 0} conversation{(conversations?.length || 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations list */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0, 112, 186, 0.06)" }}>
                  <p className="text-xs font-medium text-[#9DA3A6] uppercase tracking-wider">Conversations récentes</p>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" strokeWidth={1.5} />
                  </div>
                ) : !conversations?.length ? (
                  <div className="flex flex-col items-center justify-center py-10 text-[#9DA3A6]">
                    <ChatCircle size={32} className="mb-2 opacity-30" />
                    <p className="text-sm">Aucune conversation</p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto divide-y" style={{ borderColor: "rgba(0, 112, 186, 0.05)" }}>
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-150"
                        style={{
                          background: selectedConversation === conv.id ? "rgba(0,212,200,0.08)" : "transparent",
                          borderLeft: selectedConversation === conv.id ? "2px solid #00d4c8" : "2px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedConversation !== conv.id)
                            (e.currentTarget as HTMLElement).style.background = "rgba(0, 112, 186, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedConversation !== conv.id)
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <div
                          className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(0, 112, 186, 0.08)" }}
                        >
                          <User size={16} className="text-[#6C7378]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {conv.customerName || `Session ${conv.sessionId.slice(0, 8)}`}
                            </p>
                            {conv.hasOrder === 1 && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0"
                                style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                              >
                                <ShoppingCart size={9} />
                                Cmd
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#9DA3A6] mt-0.5">
                            <Clock size={11} />
                            <span>{new Date(conv.updatedAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                            <span>• {conv.messageCount} msg</span>
                          </div>
                        </div>
                        <CaretRight size={14} className="text-[#9DA3A6] flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages panel */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-2xl flex flex-col" style={{ height: "560px" }}>
                <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0, 112, 186, 0.06)" }}>
                  <p className="text-sm font-medium text-gray-600">
                    {selectedConversation ? `Conversation #${selectedConversation}` : "Sélectionnez une conversation"}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {!selectedConversation ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#9DA3A6]">
                      <ChatCircle size={48} className="mb-3 opacity-20" />
                      <p className="text-sm">Cliquez sur une conversation à gauche</p>
                    </div>
                  ) : messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-400" strokeWidth={1.5} />
                    </div>
                  ) : !messages?.length ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#9DA3A6]">
                      <p className="text-sm">Aucun message</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div
                            className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center"
                            style={{
                              background: msg.role === "user"
                                ? "linear-gradient(135deg, #009CDE, #0070BA)"
                                : "linear-gradient(135deg, #00d4c8, #38bdf8)",
                            }}
                          >
                            {msg.role === "user" ? (
                              <User size={12} className="text-gray-900" />
                            ) : (
                              <span className="text-white text-[10px] font-bold" style={{ color: "white" }}>B</span>
                            )}
                          </div>
                          <div
                            className="rounded-xl px-3 py-2 max-w-[80%]"
                            style={{
                              background: msg.role === "user"
                                ? "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.2))"
                                : "rgba(255,255,255,0.07)",
                              border: msg.role === "user"
                                ? "1px solid rgba(59,130,246,0.3)"
                                : "1px solid rgba(0, 112, 186, 0.08)",
                              borderTopRightRadius: msg.role === "user" ? "4px" : undefined,
                              borderTopLeftRadius: msg.role === "assistant" ? "4px" : undefined,
                            }}
                          >
                            {msg.imageUrl && (
                              <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                                <img src={msg.imageUrl} alt="uploaded" className="w-full max-w-[180px] rounded-lg mb-1.5" />
                              </a>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }} dir="auto">
                              {msg.content}
                            </p>
                            <p className="text-[10px] mt-1 text-[#9DA3A6]">
                              {new Date(msg.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
