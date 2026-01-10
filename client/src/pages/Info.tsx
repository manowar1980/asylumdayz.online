import { Navigation } from "@/components/Navigation";
import { TacticalCard } from "@/components/TacticalCard";
import { useServers } from "@/hooks/use-servers";
import { motion } from "framer-motion";
import { Map, Gamepad2, Coins, Car, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Info() {
  const { data: servers, isLoading } = useServers();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-black/90 pb-20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-12 border-b border-red-900/30 pb-6">
          <h1 className="text-4xl md:text-5xl font-tactical text-white mb-2">
            DEPLOYMENT <span className="text-red-600">ZONES</span>
          </h1>
          <p className="text-gray-400 font-mono">Select your battlefield. Prepare for combat.</p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64 w-full bg-white/5" />
            <Skeleton className="h-64 w-full bg-white/5" />
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {servers?.map((server) => (
              <motion.div key={server.id} variants={item}>
                <TacticalCard title={server.name} className="h-full">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2 text-xl font-display text-white">
                        <Map className="text-red-500" />
                        {server.map}
                      </div>
                      <span className="px-3 py-1 bg-red-900/20 text-red-400 font-mono text-sm border border-red-900/50 rounded">
                        {server.multiplier}
                      </span>
                    </div>

                    <p className="text-gray-400 font-body text-sm leading-relaxed min-h-[3rem]">
                      {server.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {server.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300 font-mono">
                          {getIconForFeature(feature)}
                          {feature}
                        </div>
                      ))}
                    </div>

                    {server.connectionInfo && (
                      <div className="mt-6 pt-4 border-t border-white/10">
                         <p className="text-xs uppercase text-gray-500 mb-1">Direct Connect</p>
                         <code className="block bg-black/50 p-3 rounded border border-white/10 text-red-400 font-mono text-sm select-all">
                           {server.connectionInfo}
                         </code>
                      </div>
                    )}
                  </div>
                </TacticalCard>
              </motion.div>
            ))}
            
            {/* Fallback Static Cards if no API data yet for demo */}
            {(!servers || servers.length === 0) && (
              <>
                 <TacticalCard title="ASYLUM™ | LIVONIA">
                    <div className="space-y-4">
                       <p className="text-gray-400">The classic survival experience enhanced. Dense forests, hidden bunkers.</p>
                       <div className="text-red-500 font-mono">Connect: 192.168.1.1:2302</div>
                    </div>
                 </TacticalCard>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function getIconForFeature(feature: string) {
  const lower = feature.toLowerCase();
  if (lower.includes("car")) return <Car className="w-4 h-4 text-blue-400" />;
  if (lower.includes("pvp")) return <ShieldAlert className="w-4 h-4 text-red-400" />;
  if (lower.includes("economy")) return <Coins className="w-4 h-4 text-yellow-400" />;
  return <Gamepad2 className="w-4 h-4 text-gray-400" />;
}
