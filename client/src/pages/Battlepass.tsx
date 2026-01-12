import { Navigation } from "@/components/Navigation";
import { useBattlepassConfig, useBattlepassLevels } from "@/hooks/use-battlepass";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock, Gift, Crown, Clock, ChevronLeft, ChevronRight, Terminal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Battlepass() {
  const { data: config } = useBattlepassConfig();
  const { data: levels, isLoading } = useBattlepassLevels();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Secret code state
  const [inputBuffer, setInputBuffer] = useState("");
  const [showSecretDialog, setShowSecretDialog] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSecretDialog) return;
      
      const char = e.key.toLowerCase();
      if (/^[a-z0-9]$/.test(char)) {
        setInputBuffer(prev => {
          const newBuffer = (prev + char).slice(-20);
          return newBuffer;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSecretDialog]);

  // Check buffer for common triggers or just a long string
  useEffect(() => {
    if (inputBuffer.includes("admin") || inputBuffer.includes("asylum")) {
      setShowSecretDialog(true);
      setInputBuffer("");
    }
  }, [inputBuffer]);

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await apiRequest("POST", "/api/admin/verify-code", { code: secretCode });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin_override", "true");
        toast({ title: "Access Granted", description: "Redirecting to Admin Console..." });
        window.location.href = "/admin";
      } else {
        toast({ title: "Access Denied", description: "Invalid secret code.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Verification failed.", variant: "destructive" });
    } finally {
      setIsVerifying(false);
      setSecretCode("");
    }
  };

  const themeColor = config?.themeColor === "tech-blue" ? "cyan" : "red";

  const scrollLeft = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const scrollRight = () => {
    if (levels && currentPage < Math.ceil(levels.length / itemsPerPage) - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const visibleLevels = levels?.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 font-sans">
      <Navigation />

      {/* Fallout-style Header Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-yellow-600/10 to-amber-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8cGF0aCBkPSJNMCA1TDUgMFpNNiA0TDQgNlpNLTEgMUwxIC0xWiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')] opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="text-xs sm:text-sm font-mono text-amber-400/80 bg-black/50 px-3 py-1 border border-amber-600/30">
                RANK 1 / 50
              </div>
              <div className="text-xs sm:text-sm font-mono text-gray-400">
                TOTAL CHALLENGES REWARDS: <span className="text-amber-400">5</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-900/80 to-red-800/80 px-4 sm:px-6 py-2 sm:py-3 border-2 border-red-600 shadow-lg shadow-red-900/50">
              <span className="font-tactical text-xl sm:text-3xl text-white tracking-wider">BLOOD & RUST</span>
            </div>

            <div className="flex items-center gap-2 text-amber-400 font-mono text-sm">
              <Clock className="w-4 h-4" />
              <span>{config?.daysLeft || 25} DAYS LEFT</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Secret Access Dialog */}
      <Dialog open={showSecretDialog} onOpenChange={setShowSecretDialog}>
        <DialogContent className="bg-zinc-900 border-red-900/50 text-white font-mono">
          <DialogHeader>
            <DialogTitle className="font-tactical flex items-center gap-2">
              <Terminal className="w-5 h-5 text-red-500" />
              SYSTEM OVERRIDE
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSecretSubmit} className="space-y-4 pt-4">
            <p className="text-xs text-gray-500">ENTER COMMAND CLEARANCE CODE:</p>
            <Input 
              type="password"
              autoFocus
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="bg-black border-red-900/50 text-red-500 focus:border-red-500 font-mono tracking-widest"
              placeholder="********"
            />
            <Button 
              type="submit" 
              className="w-full bg-red-900/50 hover:bg-red-800 text-red-500 border border-red-500/50"
              disabled={isVerifying}
            >
              {isVerifying ? "VERIFYING..." : "EXECUTE"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Season Title */}
      <div className="text-center py-6 sm:py-8 border-b border-amber-900/30">
        <h1 className={cn(
          "text-4xl sm:text-6xl md:text-7xl font-tactical tracking-wider",
          themeColor === "cyan" ? "text-cyan-400" : "text-amber-400"
        )}>
          {config?.seasonName || "GENESIS"}
        </h1>
        <p className="text-gray-500 font-mono text-sm mt-2">SEASON 01 • SCOREBOARD</p>
      </div>

      {/* Scoreboard Grid - Fallout 76 Style */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        
        {/* Navigation Arrows */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollLeft}
            disabled={currentPage === 0}
            className="text-amber-400 hover:bg-amber-900/20 disabled:opacity-30 h-10 w-10 sm:h-12 sm:w-12"
            data-testid="button-battlepass-prev"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>
          
          <div className="font-mono text-gray-500 text-sm">
            PAGE {currentPage + 1} / {levels ? Math.ceil(levels.length / itemsPerPage) : 1}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollRight}
            disabled={!levels || currentPage >= Math.ceil(levels.length / itemsPerPage) - 1}
            className="text-amber-400 hover:bg-amber-900/20 disabled:opacity-30 h-10 w-10 sm:h-12 sm:w-12"
            data-testid="button-battlepass-next"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>
        </div>

        {/* Reward Cards Grid */}
        <div ref={scrollRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {isLoading && Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] bg-zinc-800/50" />
          ))}
          
          {visibleLevels.map((lvl, idx) => (
            <motion.div
              key={lvl.id}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ScoreboardCard
                level={lvl.level}
                freeReward={lvl.freeReward}
                premiumReward={lvl.premiumReward}
                themeColor={themeColor}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom Navigation Bar - Fallout Style */}
        <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-2 sm:gap-4 text-xs font-mono border-t border-amber-900/30 pt-6">
          {["CLAIM", "RANK UP", "TUTORIAL", "S.C.O.R.E", "CHALLENGES"].map((item) => (
            <div
              key={item}
              className="px-3 sm:px-4 py-2 bg-black/50 border border-amber-900/50 text-amber-500 hover:bg-amber-900/20 cursor-pointer transition-colors"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreboardCard({
  level,
  freeReward,
  premiumReward,
  themeColor,
}: {
  level: number;
  freeReward: string;
  premiumReward: string;
  themeColor: "cyan" | "red";
}) {
  const accentColor = themeColor === "cyan" ? "cyan" : "amber";
  const isLocked = level > 1;

  return (
    <div className={cn(
      "relative aspect-[3/4] bg-gradient-to-b from-zinc-800 to-zinc-900 border-2 overflow-hidden group transition-all duration-300 hover:scale-105",
      `border-${accentColor}-900/50 hover:border-${accentColor}-500`
    )}>
      {/* Card Header - Level Number */}
      <div className={cn(
        "absolute top-0 left-0 right-0 py-1 sm:py-2 text-center font-tactical text-lg sm:text-xl border-b",
        `bg-${accentColor}-900/30 border-${accentColor}-700/50 text-${accentColor}-400`
      )}>
        {level}
      </div>

      {/* Main Reward Image Area */}
      <div className="absolute inset-0 top-8 sm:top-10 flex flex-col">
        {/* Premium Reward (Top Half) */}
        <div className={cn(
          "flex-1 flex flex-col items-center justify-center p-2 border-b relative",
          `border-${accentColor}-900/30 bg-gradient-to-b from-${accentColor}-950/20 to-transparent`
        )}>
          <Crown className={cn("w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2", `text-${accentColor}-500`)} />
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black/50 rounded border border-white/10 flex items-center justify-center mb-1 sm:mb-2">
            <Gift className={cn("w-6 h-6 sm:w-8 sm:h-8 opacity-50", `text-${accentColor}-400`)} />
          </div>
          <p className={cn("text-center text-xs font-display uppercase leading-tight line-clamp-2", `text-${accentColor}-200`)}>
            {premiumReward}
          </p>
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Lock className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
            </div>
          )}
        </div>

        {/* Free Reward (Bottom Half) */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 bg-black/20 relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/50 rounded border border-white/10 flex items-center justify-center mb-1 sm:mb-2">
            <Gift className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500" />
          </div>
          <p className="text-center text-xs text-gray-400 font-display uppercase leading-tight line-clamp-2">
            {freeReward}
          </p>
          <div className="absolute bottom-1 left-0 right-0 text-center">
            <span className="text-xs text-gray-600 font-mono">FREE</span>
          </div>
        </div>
      </div>

      {/* Glow Effect on Hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
        `shadow-[inset_0_0_30px_rgba(var(--${accentColor}-glow),0.3)]`
      )} />
    </div>
  );
}
