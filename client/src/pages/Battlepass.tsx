import { Navigation } from "@/components/Navigation";
import { useBattlepassConfig, useBattlepassLevels } from "@/hooks/use-battlepass";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock, Unlock, Zap, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Battlepass() {
  const { data: config } = useBattlepassConfig();
  const { data: levels, isLoading } = useBattlepassLevels();

  const themeColor = config?.themeColor === "tech-blue" ? "text-cyan-400" : "text-red-500";
  const borderColor = config?.themeColor === "tech-blue" ? "border-cyan-500" : "border-red-500";
  const bgGradient = config?.themeColor === "tech-blue" 
    ? "from-cyan-900/20 to-black" 
    : "from-red-900/20 to-black";

  return (
    <div className="min-h-screen bg-black font-sans pb-20 overflow-x-hidden">
      <Navigation />

      {/* Season Header */}
      <div className={cn("relative py-20 bg-gradient-to-b border-b border-white/5", bgGradient)}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={cn("text-2xl md:text-3xl font-display uppercase tracking-[0.5em] mb-4 opacity-80", themeColor)}>
              SEASON PASS
            </h2>
            <h1 className="text-6xl md:text-9xl font-tactical text-white mb-8 tracking-tighter uppercase relative inline-block">
              {config?.seasonName || "GENESIS"}
              <span className={cn("absolute -top-4 -right-8 text-sm font-mono px-2 py-1 bg-black/50 border rounded", borderColor, themeColor)}>
                S01
              </span>
            </h1>
            
            <div className="flex justify-center items-center gap-4 text-xl font-mono text-gray-400 bg-black/40 inline-block px-8 py-3 rounded-full border border-white/10 backdrop-blur-md">
              <Clock className={cn("w-5 h-5", themeColor)} />
              <span>TIME REMAINING: <span className="text-white font-bold">{config?.daysLeft || 25} DAYS</span></span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Battlepass Track */}
      <div className="max-w-full mx-auto px-4 py-12 overflow-x-auto custom-scrollbar">
        <div className="min-w-[1200px] px-8">
          
          <div className="grid grid-rows-[auto_1fr_1fr] gap-6">
             {/* Level Indicators */}
             <div className="flex gap-4 mb-4">
               {levels?.map((lvl) => (
                 <div key={lvl.id} className="w-48 text-center font-tactical text-2xl text-gray-600">
                   LVL {lvl.level}
                 </div>
               ))}
               {/* Skeletons if loading */}
               {isLoading && Array(5).fill(0).map((_, i) => (
                 <Skeleton key={i} className="w-48 h-8 bg-white/5" />
               ))}
             </div>

             {/* Free Tier Row */}
             <div className="flex gap-4">
                <div className="w-24 flex items-center justify-center font-display font-bold text-gray-500 rotate-180 writing-mode-vertical">
                  FREE
                </div>
                {levels?.map((lvl) => (
                  <BattlepassCard 
                    key={`free-${lvl.id}`} 
                    type="free" 
                    reward={lvl.freeReward} 
                    image={lvl.imageUrl}
                    unlocked={true} 
                  />
                ))}
                 {isLoading && Array(5).fill(0).map((_, i) => (
                   <Skeleton key={i} className="w-48 h-64 bg-white/5" />
                 ))}
             </div>

             {/* Premium Tier Row */}
             <div className="flex gap-4">
                <div className={cn("w-24 flex items-center justify-center font-display font-bold rotate-180 writing-mode-vertical", themeColor)}>
                  PREMIUM
                </div>
                {levels?.map((lvl) => (
                  <BattlepassCard 
                    key={`prem-${lvl.id}`} 
                    type="premium" 
                    reward={lvl.premiumReward} 
                    image={lvl.imageUrl}
                    isPremium 
                    themeColor={config?.themeColor as any}
                  />
                ))}
                {isLoading && Array(5).fill(0).map((_, i) => (
                   <Skeleton key={i} className="w-48 h-64 bg-white/5" />
                 ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function BattlepassCard({ 
  type, 
  reward, 
  image,
  isPremium, 
  unlocked = false,
  themeColor = "tech-blue" 
}: { 
  type: "free" | "premium", 
  reward: string, 
  image?: string | null,
  isPremium?: boolean, 
  unlocked?: boolean,
  themeColor?: "tech-blue" | "red"
}) {
  const accentColor = themeColor === "tech-blue" ? "cyan" : "red";
  
  return (
    <div className={cn(
      "w-48 h-64 relative group flex flex-col items-center justify-between p-4 border transition-all duration-300",
      isPremium 
        ? `bg-${accentColor}-950/10 border-${accentColor}-900/50 hover:border-${accentColor}-500` 
        : "bg-gray-900/20 border-gray-800 hover:border-gray-600"
    )}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      
      {/* Top Status */}
      <div className="w-full flex justify-between items-start z-10">
        {isPremium ? (
          <Lock className={cn("w-4 h-4", `text-${accentColor}-500`)} />
        ) : (
          <Unlock className="w-4 h-4 text-gray-500" />
        )}
        {isPremium && <Zap className={cn("w-4 h-4", `text-${accentColor}-400`)} />}
      </div>

      {/* Image Placeholder */}
      <div className="relative z-10 w-24 h-24 bg-black/50 rounded-full border border-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
        {image ? (
            <img src={image} alt={reward} className="w-full h-full object-cover rounded-full opacity-80" />
        ) : (
            <div className={cn("text-4xl font-tactical opacity-20", isPremium ? `text-${accentColor}-500` : "text-gray-500")}>
              ?
            </div>
        )}
      </div>

      {/* Reward Name */}
      <div className="text-center z-10">
        <p className={cn(
          "font-display font-bold text-sm uppercase tracking-wide",
          isPremium ? `text-${accentColor}-100` : "text-gray-300"
        )}>
          {reward}
        </p>
      </div>

      {/* Hover Effect Border */}
      <div className={cn(
        "absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
        isPremium ? `border-${accentColor}-500 box-shadow-glow-${accentColor}` : "border-white"
      )} />
    </div>
  );
}
