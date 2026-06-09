import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2, Send, Sparkles, Mic } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Streamdown } from "streamdown";
import AnimatedAIOrb from "./AnimatedAIOrb";

/**
 * Message type matching server-side LLM Message interface
 */
export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIChatBoxProps = {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  height?: string | number;
  emptyStateMessage?: string;
  suggestedPrompts?: string[];
};

export function AIChatBox({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Posez votre question à l'IA...",
  className,
  height = "600px",
  emptyStateMessage = "Commencez une conversation avec l'IA",
  suggestedPrompts,
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter out system messages
  const displayMessages = messages.filter((msg) => msg.role !== "system");

  // Calculate min-height for last assistant message
  const [minHeightForLastMessage, setMinHeightForLastMessage] = useState(0);

  useEffect(() => {
    if (containerRef.current && inputAreaRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const inputHeight = inputAreaRef.current.offsetHeight;
      const scrollAreaHeight = containerHeight - inputHeight;
      const userMessageReservedHeight = 56;
      const calculatedHeight = scrollAreaHeight - 32 - userMessageReservedHeight;
      setMinHeightForLastMessage(Math.max(0, calculatedHeight));
    }
  }, []);

  // Scroll to bottom helper function
  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement;

    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    onSendMessage(trimmedInput);
    setInput("");
    scrollToBottom();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-gradient-to-b from-[#1a0f2e] to-[#0f0a1a] text-foreground rounded-2xl border border-purple-500/20 shadow-2xl backdrop-blur-xl",
        "bg-opacity-80",
        className
      )}
      style={{ height }}
    >
      {/* Header with AI Orb */}
      <div className="flex items-center justify-between p-6 border-b border-purple-500/10 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <AnimatedAIOrb 
              isThinking={isLoading} 
              isListening={isListening}
              size="sm" 
            />
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Bysis AI
            </h3>
            <p className="text-xs text-muted-foreground">Assistant Intelligent</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" strokeWidth={1.5} />
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col p-6">
            <div className="flex flex-1 flex-col items-center justify-center gap-8 text-muted-foreground">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <AnimatedAIOrb 
                    isThinking={false} 
                    isListening={false}
                    size="lg" 
                  />
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl"></div>
                </div>
                <p className="text-center text-sm font-medium">{emptyStateMessage}</p>
              </div>

              {suggestedPrompts && suggestedPrompts.length > 0 && (
                <div className="flex max-w-2xl flex-wrap justify-center gap-3">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => onSendMessage(prompt)}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:border-purple-500/60 text-foreground transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col space-y-4 p-6">
              {displayMessages.map((message, index) => {
                const isLastMessage = index === displayMessages.length - 1;
                const shouldApplyMinHeight =
                  isLastMessage && !isLoading && minHeightForLastMessage > 0;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300",
                      message.role === "user"
                        ? "justify-end items-start"
                        : "justify-start items-start"
                    )}
                    style={
                      shouldApplyMinHeight
                        ? { minHeight: `${minHeightForLastMessage}px` }
                        : undefined
                    }
                  >
                    {message.role === "assistant" && (
                      <div className="size-8 shrink-0 mt-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                        <Sparkles className="size-4 text-white" strokeWidth={1.5} />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-3 text-sm",
                        message.role === "user"
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 rounded-br-none"
                          : "bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-foreground border border-purple-500/30 backdrop-blur-sm rounded-bl-none"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <Streamdown>{message.content}</Streamdown>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="size-8 shrink-0 mt-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <Loader2 className="size-4 text-white animate-spin" strokeWidth={1.5} />
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-foreground border border-purple-500/30 backdrop-blur-sm rounded-2xl rounded-bl-none px-4 py-3 flex gap-2">
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <form
        ref={inputAreaRef}
        onSubmit={handleSubmit}
        className="flex-shrink-0 border-t border-purple-500/10 bg-gradient-to-t from-[#1a0f2e] to-transparent p-4 backdrop-blur-sm"
      >
        <div className="flex gap-3 items-end">
          <button
            type="button"
            onClick={() => setIsListening(!isListening)}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300 shrink-0",
              isListening
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
            )}
            title="Écoute vocale"
          >
            <Mic className="size-5" strokeWidth={1.5} />
          </button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="resize-none bg-purple-500/10 border border-purple-500/30 text-foreground placeholder:text-muted-foreground focus:border-purple-500/60 focus:bg-purple-500/20 rounded-xl backdrop-blur-sm"
            rows={1}
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300 shrink-0",
              isLoading || !input.trim()
                ? "bg-purple-500/10 text-purple-500/50 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
            )}
            title="Envoyer"
          >
            <Send className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
