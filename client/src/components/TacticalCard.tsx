import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TacticalCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  glowColor?: "red" | "blue";
}

export function TacticalCard({ children, className, title, glowColor = "red" }: TacticalCardProps) {
  const borderColor = glowColor === "blue" ? "border-cyan-500/30" : "border-red-900/50";
  const hoverBorderColor = glowColor === "blue" ? "group-hover:border-cyan-400" : "group-hover:border-red-500";
  const titleColor = glowColor === "blue" ? "text-cyan-400" : "text-red-500";
  const cornerColor = glowColor === "blue" ? "border-cyan-500" : "border-red-500";

  return (
    <div className={cn(
      "group relative bg-black/60 backdrop-blur-sm border transition-all duration-300 overflow-hidden",
      borderColor,
      hoverBorderColor,
      className
    )}>
      {/* Corner Brackets */}
      <div className={cn("absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2", cornerColor)} />
      <div className={cn("absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2", cornerColor)} />
      <div className={cn("absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2", cornerColor)} />
      <div className={cn("absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2", cornerColor)} />

      {/* Header if present */}
      {title && (
        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <h3 className={cn("font-tactical tracking-widest text-lg uppercase", titleColor)}>
            {title}
          </h3>
          {/* Decorative dots */}
          <div className="flex gap-1">
            <div className={cn("w-1.5 h-1.5 rounded-full", glowColor === "blue" ? "bg-cyan-500" : "bg-red-500")} />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6 relative z-10">
        {children}
      </div>

      {/* Background Grid Scanline Effect */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
    </div>
  );
}
