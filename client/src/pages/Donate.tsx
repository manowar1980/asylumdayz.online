import { Navigation } from "@/components/Navigation";
import { TacticalCard } from "@/components/TacticalCard";
import { Button } from "@/components/ui/button";
import { CreditCard, Heart, Star } from "lucide-react";

export default function Donate() {
  return (
    <div className="min-h-screen bg-black font-sans">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-tactical text-white mb-4">SUPPORT THE <span className="text-red-600">ASYLUM</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-mono">
            All donations go directly towards server upkeep, new hardware, and funding the prize pools for community events.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <TacticalCard title="ONE-TIME DONATION" glowColor="red">
             <div className="flex flex-col items-center py-8">
               <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
                 <Heart className="w-10 h-10 text-red-500" />
               </div>
               <p className="text-center text-gray-400 mb-8 font-mono text-sm px-4">
                 Help us keep the lights on. Every bit counts towards keeping the servers lag-free and online 24/7.
               </p>
               <a href="https://paypal.com" target="_blank" rel="noopener noreferrer" className="w-full">
                 <Button className="w-full bg-red-700 hover:bg-red-600 text-white font-bold h-12 tracking-wider">
                   DONATE VIA PAYPAL
                 </Button>
               </a>
             </div>
          </TacticalCard>

          <TacticalCard title="PRIORITY QUEUE" glowColor="blue">
             <div className="flex flex-col items-center py-8">
               <div className="w-20 h-20 bg-cyan-900/20 rounded-full flex items-center justify-center mb-6 border border-cyan-500/30">
                 <Star className="w-10 h-10 text-cyan-500" />
               </div>
               <p className="text-center text-gray-400 mb-8 font-mono text-sm px-4">
                 Skip the line. Get instant access to full servers and a special Discord role to show your support.
               </p>
               <Button className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold h-12 tracking-wider" disabled>
                 COMING SOON
               </Button>
             </div>
          </TacticalCard>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center">
           <p className="text-xs text-gray-600 font-mono uppercase">
             By donating you agree to the Terms of Service. Donations are non-refundable. 
             <br/>This is not a purchase of goods or services.
           </p>
        </div>
      </div>
    </div>
  );
}
