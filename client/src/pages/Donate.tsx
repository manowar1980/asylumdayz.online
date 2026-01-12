import { Navigation } from "@/components/Navigation";
import { TacticalCard } from "@/components/TacticalCard";
import { Button } from "@/components/ui/button";
import { Heart, Star, Gift, CheckCircle } from "lucide-react";
import { FaDiscord, FaPaypal } from "react-icons/fa";

export default function Donate() {
  return (
    <div className="min-h-screen bg-black font-sans">
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-tactical text-white mb-4">
            SUPPORT THE <span className="text-red-600">ASYLUM</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm sm:text-base px-4">
            All donations go directly towards server upkeep, new hardware, and funding the prize pools for community events.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* PayPal Donation with Discord Rewards */}
          <TacticalCard title="PAYPAL DONATION" glowColor="red">
            <div className="flex flex-col items-center py-6 sm:py-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-900/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 border border-red-500/30">
                <FaPaypal className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
              </div>
              
              <p className="text-center text-gray-400 mb-6 font-mono text-xs sm:text-sm px-2 sm:px-4">
                Donate via PayPal and receive exclusive rewards if you're in our Discord server!
              </p>

              {/* Rewards List */}
              <div className="w-full bg-black/30 border border-red-900/30 p-3 sm:p-4 mb-6">
                <h4 className="text-red-400 font-display text-sm mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  DISCORD MEMBER REWARDS
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>$5+ — Supporter Role + Name Color</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>$10+ — Priority Queue Access</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>$25+ — VIP Role + Exclusive Channels</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>$50+ — Legendary Status + All Perks</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-400 mb-4 font-mono">
                <FaDiscord className="w-4 h-4" />
                Must be in Discord to claim rewards
              </div>

              <a 
                href="https://paypal.me/asylumdayz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full"
              >
                <Button 
                  className="w-full bg-red-700 hover:bg-red-600 text-white font-bold h-12 tracking-wider"
                  data-testid="button-donate-paypal"
                >
                  <FaPaypal className="mr-2 w-5 h-5" />
                  DONATE VIA PAYPAL
                </Button>
              </a>
            </div>
          </TacticalCard>

          {/* Priority Queue / Coming Soon */}
          <TacticalCard title="PREMIUM PERKS" glowColor="blue">
            <div className="flex flex-col items-center py-6 sm:py-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-900/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 border border-cyan-500/30">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500" />
              </div>
              
              <p className="text-center text-gray-400 mb-6 font-mono text-xs sm:text-sm px-2 sm:px-4">
                Monthly subscription coming soon! Skip queues, get exclusive gear, and support ongoing development.
              </p>

              {/* Coming Soon Features */}
              <div className="w-full bg-black/30 border border-cyan-900/30 p-3 sm:p-4 mb-6">
                <h4 className="text-cyan-400 font-display text-sm mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  COMING SOON
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border border-gray-600 rounded flex-shrink-0" />
                    <span>Priority Server Queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border border-gray-600 rounded flex-shrink-0" />
                    <span>Monthly Exclusive Skins</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border border-gray-600 rounded flex-shrink-0" />
                    <span>Private Events Access</span>
                  </li>
                </ul>
              </div>

              <Button 
                className="w-full bg-cyan-700/50 text-white font-bold h-12 tracking-wider cursor-not-allowed"
                disabled
                data-testid="button-premium-soon"
              >
                COMING SOON
              </Button>
            </div>
          </TacticalCard>
        </div>

        <div className="mt-12 sm:mt-16 border-t border-white/10 pt-6 sm:pt-8 text-center">
          <p className="text-xs text-gray-600 font-mono uppercase px-4">
            By donating you agree to the Terms of Service. Donations are non-refundable. 
            <br className="hidden sm:block"/>This is not a purchase of goods or services.
          </p>
        </div>
      </div>
    </div>
  );
}
