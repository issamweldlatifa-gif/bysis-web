import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";

export default function Chatbot() {
  const [sessionId, setSessionId] = useState<string>(() => {
    const stored = localStorage.getItem("bysis-session-id");
    return stored || nanoid();
  });

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessageMutation = trpc.chat.addMessage.useMutation();
  const { data: conversation } = trpc.chat.getOrCreateConversation.useQuery({
    sessionId,
  });
  const { data: messagesData } = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId || 0 },
    { enabled: !!conversationId }
  );

  // Store session ID
  useEffect(() => {
    localStorage.setItem("bysis-session-id", sessionId);
  }, [sessionId]);

  // Initialize conversation
  useEffect(() => {
    if (conversation) {
      setConversationId(conversation.id);
      setIsInitializing(false);
    }
  }, [conversation]);

  // Update messages when data changes
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Add user message
      await addMessageMutation.mutateAsync({
        conversationId,
        role: "user",
        content: userMessage,
      });

      // Add user message to UI immediately
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          role: "user",
          content: userMessage,
          createdAt: new Date(),
        },
      ]);

      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage);

      // Add AI message
      await addMessageMutation.mutateAsync({
        conversationId,
        role: "assistant",
        content: aiResponse,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          role: "assistant",
          content: aiResponse,
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Placeholder responses - in production, call LLM API
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("prix") ||
      lowerMessage.includes("coût") ||
      lowerMessage.includes("tarif")
    ) {
      return "Nos tarifs dépendent du type de produit et de sa qualité. Utilisez notre calculateur pour obtenir un devis précis en uploadant une image du produit.";
    }

    if (
      lowerMessage.includes("livraison") ||
      lowerMessage.includes("délai") ||
      lowerMessage.includes("transport")
    ) {
      return "Nous livrons en 20-25 jours ouvrables. Le délai comprend la commande, l'expédition depuis la plateforme et la livraison chez vous.";
    }

    if (
      lowerMessage.includes("paiement") ||
      lowerMessage.includes("payer") ||
      lowerMessage.includes("facture")
    ) {
      return "Nous acceptons les virements bancaires et les paiements mobiles. Vous recevrez une facture après confirmation de votre commande.";
    }

    if (
      lowerMessage.includes("commande") ||
      lowerMessage.includes("commander") ||
      lowerMessage.includes("comment")
    ) {
      return "Pour passer une commande : 1) Uploadez une image du produit, 2) Remplissez vos informations, 3) Confirmez la commande. Vous recevrez un code de suivi pour suivre votre colis.";
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("support")) {
      return "Vous pouvez nous contacter via ce chat ou par email. Notre équipe répond généralement dans les 24 heures.";
    }

    return "Merci pour votre question ! Comment puis-je vous aider davantage ? Vous pouvez me demander des informations sur nos tarifs, délais de livraison, ou le processus de commande.";
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Initialisation du chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-bold">Support Client Bysis</h1>
                <p className="text-blue-100 text-sm">
                  Posez vos questions sur nos services
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">
                    Bienvenue ! Posez vos questions sur nos services.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-200 text-slate-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === "user"
                          ? "text-blue-100"
                          : "text-slate-600"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-200 text-slate-900 px-4 py-2 rounded-lg rounded-bl-none">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isLoading && handleSendMessage()
                }
                placeholder="Écrivez votre message..."
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
