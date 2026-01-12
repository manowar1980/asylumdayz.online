import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import asylumAILogo from "@assets/Asylum_Image_(AI)_1768242517159.png";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

export function AsylumAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to Asylum DayZ! I'm Asylum AI, your tactical assistant. How can I help you survive today? You can also send me images to analyze!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = input.trim() || "What's in this image?";
    const currentImage = imagePreview;
    
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage, image: currentImage || undefined }]);
    clearImage();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", userMessage);
      formData.append("history", JSON.stringify(messages.map(m => ({ role: m.role, content: m.content }))));
      
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });
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
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="Uploaded" 
                          className="max-w-full rounded mb-2 max-h-32 object-cover"
                        />
                      )}
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

            {imagePreview && (
              <div className="px-3 py-2 border-t border-red-900/30 bg-black/30">
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-16 rounded object-cover"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    data-testid="button-remove-image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={sendMessage} className="p-3 border-t border-red-900/30 bg-black/50">
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                  data-testid="input-file-upload"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-white hover:bg-red-900/30 shrink-0"
                  disabled={isLoading}
                  data-testid="button-attach-image"
                >
                  <ImagePlus className="w-5 h-5" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedImage ? "Ask about this image..." : "Ask Asylum AI..."}
                  className="flex-1 bg-zinc-800 border-red-900/30 text-white placeholder:text-gray-500 focus:border-red-500"
                  disabled={isLoading}
                  data-testid="input-chat-message"
                />
                <Button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !selectedImage)}
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
