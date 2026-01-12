import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import asylumAILogo from "@assets/Asylum_Image_(AI)_1768242517159.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AsylumAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to Asylum DayZ! I'm Asylum AI, your tactical assistant. How can I help you survive today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/chat", { message: userMessage, history: messages });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[70vh] bg-zinc-900 border-2 border-red-900/50 rounded-lg shadow-2xl shadow-red-900/20 flex flex-col z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-900/50 to-zinc-900 border-b border-red-900/30">
              <div className="flex items-center gap-2">
                <img src={asylumAILogo} alt="Asylum AI" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <h3 className="font-tactical text-white text-sm">ASYLUM AI</h3>
                  <p className="text-xs text-green-400 font-mono">ONLINE</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-red-900/30"
                data-testid="button-close-chat"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea ref={scrollRef} className="flex-1 p-3">
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-red-900/50 text-white"
                          : "bg-zinc-800 text-gray-200 border border-red-900/20"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 text-gray-200 border border-red-900/20 px-3 py-2 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <form onSubmit={sendMessage} className="p-3 border-t border-red-900/30 bg-black/50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Asylum AI..."
                  className="flex-1 bg-zinc-800 border-red-900/30 text-white placeholder:text-gray-500 focus:border-red-500"
                  disabled={isLoading}
                  data-testid="input-chat-message"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-red-700 hover:bg-red-600 text-white"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-6 w-16 h-16 rounded-full overflow-hidden border-2 border-red-600 shadow-lg shadow-red-900/50 z-50 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-open-chat"
      >
        <img
          src={asylumAILogo}
          alt="Asylum AI"
          className="w-full h-full object-cover"
        />
      </motion.button>
    </>
  );
}
