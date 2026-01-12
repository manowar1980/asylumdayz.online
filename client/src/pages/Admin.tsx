import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { useBattlepassConfig, useBattlepassLevels, useUpdateBattlepassConfig, useUpdateLevel } from "@/hooks/use-battlepass";
import { TacticalCard } from "@/components/TacticalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Mail, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBattlepassConfigSchema, insertBattlepassLevelSchema } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: config, isLoading: configLoading } = useBattlepassConfig();
  const { data: levels, isLoading: levelsLoading } = useBattlepassLevels();
  
  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Auth...</div>;
  
  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 gap-4 px-4">
        <h1 className="text-3xl sm:text-4xl font-tactical text-center">ACCESS DENIED</h1>
        <p className="font-mono text-sm sm:text-base">Clearance Level Insufficient.</p>
        <Button onClick={() => window.location.href = "/"}>Return to Base</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-sans pb-12 sm:pb-20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-tactical text-white">ADMIN <span className="text-red-600">CONSOLE</span></h1>
          <div className="px-3 py-1 border border-red-500 text-red-500 font-mono text-xs uppercase rounded bg-red-950/20 animate-pulse">
            System Override Enabled
          </div>
        </div>

        <div className="grid gap-8 sm:gap-12">
          {/* Support Requests Section */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display text-white mb-4 sm:mb-6 border-l-4 border-red-500 pl-4">SUPPORT REQUESTS</h2>
            <SupportRequestsList />
          </section>

          {/* Season Config Section */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display text-white mb-4 sm:mb-6 border-l-4 border-blue-500 pl-4">SEASON CONFIGURATION</h2>
            {configLoading ? <Loader2 className="animate-spin text-white" /> : (
              <SeasonConfigForm initialData={config} />
            )}
          </section>

          {/* Level Editor Section */}
          <section>
            <h2 className="text-xl sm:text-2xl font-display text-white mb-4 sm:mb-6 border-l-4 border-green-500 pl-4">BATTLEPASS REWARDS</h2>
            <div className="grid gap-3 sm:gap-4">
              {levelsLoading ? <Loader2 className="animate-spin text-white" /> : (
                levels?.slice(0, 10).map((level) => (
                  <LevelEditorRow key={level.id} level={level} />
                ))
              )}
              {levels && levels.length > 10 && (
                <p className="text-gray-500 font-mono text-sm text-center">
                  Showing first 10 levels. ({levels.length} total)
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SupportRequestsList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/support"],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/support/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support"] });
      toast({ title: "Status updated" });
    },
  });

  if (isLoading) return <Loader2 className="animate-spin text-white" />;

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 font-mono">
        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No support requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(requests as any[]).map((req) => (
        <TacticalCard key={req.id} className="!p-3 sm:!p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={req.status === "pending" ? "destructive" : req.status === "resolved" ? "default" : "secondary"} className="text-xs">
                  {req.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                  {req.status === "resolved" && <CheckCircle className="w-3 h-3 mr-1" />}
                  {req.status.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-500 font-mono">{req.category}</span>
                <span className="text-xs text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-display text-white text-sm sm:text-base mb-1 truncate">{req.subject}</h3>
              <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{req.message}</p>
              <div className="mt-2 text-xs text-gray-500 font-mono space-y-0.5">
                {req.name && <div>Name: {req.name}</div>}
                {req.email && <div>Email: {req.email}</div>}
                {req.discordUsername && <div>Discord: {req.discordUsername}</div>}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {req.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-500 border-green-500/50 hover:bg-green-950/30 text-xs h-8"
                  onClick={() => updateStatus.mutate({ id: req.id, status: "resolved" })}
                  disabled={updateStatus.isPending}
                  data-testid={`button-resolve-${req.id}`}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Resolve
                </Button>
              )}
              {req.status === "resolved" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:bg-white/5 text-xs h-8"
                  onClick={() => updateStatus.mutate({ id: req.id, status: "pending" })}
                  disabled={updateStatus.isPending}
                  data-testid={`button-reopen-${req.id}`}
                >
                  Reopen
                </Button>
              )}
            </div>
          </div>
        </TacticalCard>
      ))}
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label className="text-gray-400 text-sm">Season Name</Label>
            <Input {...form.register("seasonName")} className="bg-black/50 border-white/10 text-white h-10 sm:h-12" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400 text-sm">Days Remaining</Label>
            <Input type="number" {...form.register("daysLeft", { valueAsNumber: true })} className="bg-black/50 border-white/10 text-white h-10 sm:h-12" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-gray-400 text-sm">Visual Theme</Label>
          <Select 
            onValueChange={(val) => form.setValue("themeColor", val)} 
            defaultValue={form.getValues("themeColor")}
          >
            <SelectTrigger className="bg-black/50 border-white/10 text-white h-10 sm:h-12">
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
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wider h-10 sm:h-12"
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white/5 border border-white/5 rounded hover:border-white/20 transition-colors">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black border border-white/10 rounded font-tactical text-lg sm:text-xl text-gray-500 flex-shrink-0">
          {level.level}
        </div>
        <div className="min-w-0">
          <div className="text-xs sm:text-sm text-gray-400 truncate">FREE: <span className="text-white">{level.freeReward}</span></div>
          <div className="text-xs sm:text-sm text-blue-400 truncate">PREMIUM: <span className="text-white">{level.premiumReward}</span></div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="hover:bg-white/10 text-gray-400 hover:text-white h-9 self-end sm:self-auto">
            <Edit className="w-4 h-4 mr-2" /> EDIT
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="font-tactical">EDIT LEVEL {level.level}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm">Free Reward</Label>
              <Input {...form.register("freeReward")} className="bg-black/50 border-white/20 h-10 sm:h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-blue-400 text-sm">Premium Reward</Label>
              <Input {...form.register("premiumReward")} className="bg-black/50 border-blue-900/50 focus:border-blue-500 h-10 sm:h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Image URL (Optional)</Label>
              <Input {...form.register("imageUrl")} className="bg-black/50 border-white/20 h-10 sm:h-12" placeholder="https://..." />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 h-10 sm:h-12" disabled={updateLevel.isPending}>
              {updateLevel.isPending ? "SAVING..." : "SAVE CHANGES"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
