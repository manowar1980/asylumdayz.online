import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { useBattlepassConfig, useBattlepassLevels, useUpdateBattlepassConfig, useUpdateLevel } from "@/hooks/use-battlepass";
import { TacticalCard } from "@/components/TacticalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Edit, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBattlepassConfigSchema, insertBattlepassLevelSchema } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";
import { redirectToLogin } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: config, isLoading: configLoading } = useBattlepassConfig();
  const { data: levels, isLoading: levelsLoading } = useBattlepassLevels();
  
  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Auth...</div>;
  
  // Protect Route
  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 gap-4">
        <h1 className="text-4xl font-tactical">ACCESS DENIED</h1>
        <p className="font-mono">Clearance Level Insufficient.</p>
        <Button onClick={() => window.location.href = "/"}>Return to Base</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-sans pb-20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-tactical text-white">ADMIN <span className="text-red-600">CONSOLE</span></h1>
          <div className="px-3 py-1 border border-red-500 text-red-500 font-mono text-xs uppercase rounded bg-red-950/20 animate-pulse">
            System Override Enabled
          </div>
        </div>

        <div className="grid gap-12">
          {/* Season Config Section */}
          <section>
             <h2 className="text-2xl font-display text-white mb-6 border-l-4 border-blue-500 pl-4">SEASON CONFIGURATION</h2>
             {configLoading ? <Loader2 className="animate-spin text-white" /> : (
               <SeasonConfigForm initialData={config} />
             )}
          </section>

          {/* Level Editor Section */}
          <section>
            <h2 className="text-2xl font-display text-white mb-6 border-l-4 border-green-500 pl-4">BATTLEPASS REWARDS</h2>
            <div className="grid gap-4">
              {levelsLoading ? <Loader2 className="animate-spin text-white" /> : (
                levels?.map((level) => (
                  <LevelEditorRow key={level.id} level={level} />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SeasonConfigForm({ initialData }: { initialData?: any }) {
  const updateConfig = useUpdateBattlepassConfig();
  const formSchema = insertBattlepassConfigSchema.pick({ seasonName: true, daysLeft: true, themeColor: true });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seasonName: initialData?.seasonName || "Genesis",
      daysLeft: initialData?.daysLeft || 25,
      themeColor: initialData?.themeColor || "tech-blue"
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateConfig.mutate(data);
  };

  return (
    <TacticalCard glowColor="blue" className="max-w-2xl">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-400">Season Name</Label>
            <Input {...form.register("seasonName")} className="bg-black/50 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400">Days Remaining</Label>
            <Input type="number" {...form.register("daysLeft", { valueAsNumber: true })} className="bg-black/50 border-white/10 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
           <Label className="text-gray-400">Visual Theme</Label>
           <Select 
             onValueChange={(val) => form.setValue("themeColor", val)} 
             defaultValue={form.getValues("themeColor")}
           >
             <SelectTrigger className="bg-black/50 border-white/10 text-white">
               <SelectValue placeholder="Select theme" />
             </SelectTrigger>
             <SelectContent className="bg-gray-900 border-white/10 text-white">
               <SelectItem value="tech-blue">Tech Blue (Genesis)</SelectItem>
               <SelectItem value="red">Blood Red (Hostile)</SelectItem>
             </SelectContent>
           </Select>
        </div>

        <Button 
          type="submit" 
          disabled={updateConfig.isPending}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wider"
        >
          {updateConfig.isPending ? "SAVING..." : "SAVE CONFIGURATION"}
        </Button>
      </form>
    </TacticalCard>
  );
}

function LevelEditorRow({ level }: { level: any }) {
  const [open, setOpen] = useState(false);
  const updateLevel = useUpdateLevel();
  const { toast } = useToast();

  const formSchema = insertBattlepassLevelSchema.pick({ freeReward: true, premiumReward: true, imageUrl: true });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      freeReward: level.freeReward,
      premiumReward: level.premiumReward,
      imageUrl: level.imageUrl || ""
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateLevel.mutate(
      { id: level.id, ...data },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded hover:border-white/20 transition-colors">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 flex items-center justify-center bg-black border border-white/10 rounded font-tactical text-xl text-gray-500">
          {level.level}
        </div>
        <div>
           <div className="text-sm text-gray-400">FREE: <span className="text-white">{level.freeReward}</span></div>
           <div className="text-sm text-blue-400">PREMIUM: <span className="text-white">{level.premiumReward}</span></div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="hover:bg-white/10 text-gray-400 hover:text-white">
            <Edit className="w-4 h-4 mr-2" /> EDIT
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-tactical">EDIT LEVEL {level.level}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Free Reward</Label>
              <Input {...form.register("freeReward")} className="bg-black/50 border-white/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-blue-400">Premium Reward</Label>
              <Input {...form.register("premiumReward")} className="bg-black/50 border-blue-900/50 focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              <Label>Image URL (Optional)</Label>
              <Input {...form.register("imageUrl")} className="bg-black/50 border-white/20" placeholder="https://..." />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={updateLevel.isPending}>
              {updateLevel.isPending ? "SAVING..." : "SAVE CHANGES"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
