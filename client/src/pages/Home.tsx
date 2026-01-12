import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";
import { ArrowRight, Crosshair, Skull } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import logoImg from "@assets/Asylum_Image_(logo)_1768056666318.jpeg";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-black">
      <Navigation />
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-4 py-12 sm:py-16 overflow-hidden">
        
        {/* Dark Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,5,5,0.15)_0%,transparent_70%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Logo */}
          <div className="relative mb-6 sm:mb-8 group">
            <div className="absolute -inset-2 bg-red-600 rounded-full opacity-20 group-hover:opacity-40 blur-2xl transition-opacity duration-500" />
            <img 
              src={logoImg} 
              alt="Asylum DayZ Logo" 
              className="w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 object-cover rounded-full border-4 border-red-900/50 shadow-[0_0_40px_rgba(139,5,5,0.6)] relative z-10"
              data-testid="img-logo"
            />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-tactical text-white mb-2 tracking-widest">
            <span className="blood-drip">ASYLUM</span>{" "}
            <span className="text-red-600 blood-drip-delayed">DAYZ</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-display tracking-widest uppercase mb-8 sm:mb-12 max-w-2xl px-4">
            Survive the madness. Embrace the chaos.
            <br/>
            <span className="text-red-500 font-bold">PvPvE | 100x Loot | Full Cars</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-md px-4">
            <a 
              href="https://discord.gg/asylumdayz" 
              target="_blank" 
              rel="noreferrer"
              className="flex-1"
            >
              <Button 
                className="w-full h-12 sm:h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-base sm:text-lg tracking-wider relative overflow-hidden group"
                data-testid="button-discord"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out skew-x-12" />
                <FaDiscord className="mr-2 w-5 h-5" />
                JOIN DISCORD
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            
            <Link href="/info" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full h-12 sm:h-14 border-red-600 text-red-500 hover:bg-red-950/50 hover:text-white font-bold text-base sm:text-lg tracking-wider border-2"
                data-testid="button-serverinfo"
              >
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
          className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex flex-wrap justify-center gap-4 sm:gap-12 text-gray-500 font-mono text-xs uppercase tracking-[0.2em] px-4"
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
