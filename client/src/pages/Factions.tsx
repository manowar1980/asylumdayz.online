import { Navigation } from "@/components/Navigation";
import { TacticalCard } from "@/components/TacticalCard";
import { Users, Shield, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Factions() {
  return (
    <div className="min-h-screen bg-black font-sans pb-12 sm:pb-20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-tactical text-white uppercase tracking-tighter">
            FACTION <span className="text-red-600">MANAGEMENT</span>
          </h1>
          
          <Button className="bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest">
            <Plus className="w-4 h-4 mr-2" /> REGISTER NEW FACTION
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <TacticalCard title="MY FACTION" glowColor="red">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Shield className="w-16 h-16 text-gray-800" />
              <div>
                <h3 className="text-xl font-display text-white">NO ACTIVE FACTION</h3>
                <p className="text-gray-500 text-sm mt-1">You are currently a lone survivor.</p>
              </div>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                JOIN A FACTION
              </Button>
            </div>
          </TacticalCard>

          <TacticalCard title="FACTION INTEL" glowColor="blue">
            <div className="space-y-4">
              <div className="p-3 bg-white/5 border border-white/5 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-bold">RECRUITMENT STATUS</p>
                    <p className="text-xs text-gray-500">Open for applications</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              
              <div className="p-3 bg-white/5 border border-white/5 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-bold">TERRITORY CONTROL</p>
                    <p className="text-xs text-gray-500">3 Sectors Secured</p>
                  </div>
                </div>
                <Settings className="w-4 h-4 text-gray-600" />
              </div>

              <div className="mt-6 border-t border-white/5 pt-4">
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                  [REDACTED] Encrypted Faction Data Feed Active
                </p>
              </div>
            </div>
          </TacticalCard>
        </div>
      </div>
    </div>
  );
}
