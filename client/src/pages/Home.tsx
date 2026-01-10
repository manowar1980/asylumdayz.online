import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";
import { ArrowRight, Crosshair, Skull } from "lucide-react";
import logoImg from "@assets/Asylum_Image_(logo)_1768056666318.jpeg";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navigation />
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-4 py-16 overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.3, 0.1], 
              scale: [1, 1.05, 1] 
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(139,5,5,0.2)_0%,transparent_60%)]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Logo with Glitch Effect placeholder logic */}
          <div className="relative mb-8 group">
            <div className="absolute -inset-1 bg-red-600 rounded-full opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500"></div>
            <img 
              src={logoImg} 
              alt="Asylum DayZ Logo" 
              className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full border-4 border-red-900/50 shadow-[0_0_30px_rgba(139,5,5,0.5)] relative z-10"
            />
          </div>

          <h1 className="text-6xl md:text-8xl font-tactical text-white mb-2 tracking-widest text-glow drop-shadow-xl">
            ASYLUM <span className="text-red-600">DAYZ</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 font-display tracking-widest uppercase mb-12 max-w-2xl">
            Survive the madness. Embrace the chaos.
            <br/>
            <span className="text-red-500 font-bold">PvPvE | 100x Loot | Full Cars</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <a 
              href="https://discord.gg/asylumdayz" 
              target="_blank" 
              rel="noreferrer"
              className="flex-1"
            >
              <Button className="w-full h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-lg tracking-wider clip-path-slant relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out skew-x-12" />
                JOIN DISCORD
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            
            <Link href="/info" className="flex-1">
              <Button variant="outline" className="w-full h-14 border-red-600 text-red-500 hover:bg-red-950/50 hover:text-white font-bold text-lg tracking-wider border-2">
                SERVER INFO
                <Crosshair className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Decorative Status Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center gap-12 text-gray-500 font-mono text-xs uppercase tracking-[0.2em]"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Status: Online
          </div>
          <div className="flex items-center gap-2">
            <Skull className="w-3 h-3" />
            Kills: 24,932
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            Region: Global
          </div>
        </motion.div>
      </main>
    </div>
  );
}
