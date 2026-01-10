import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";

export function useBattlepassConfig() {
  return useQuery({
    queryKey: [api.battlepass.getConfig.path],
    queryFn: async () => {
      const res = await fetch(api.battlepass.getConfig.path);
      if (!res.ok) throw new Error("Failed to fetch battlepass config");
      return api.battlepass.getConfig.responses[200].parse(await res.json());
    },
  });
}

export function useBattlepassLevels() {
  return useQuery({
    queryKey: [api.battlepass.listLevels.path],
    queryFn: async () => {
      const res = await fetch(api.battlepass.listLevels.path);
      if (!res.ok) throw new Error("Failed to fetch levels");
      const data = await res.json();
      // Sort client side just in case, though API should handle order usually
      const parsed = api.battlepass.listLevels.responses[200].parse(data);
      return parsed.sort((a, b) => a.level - b.level);
    },
  });
}

export function useUpdateBattlepassConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.battlepass.updateConfig.input>) => {
      const res = await fetch(api.battlepass.updateConfig.path, {
        method: api.battlepass.updateConfig.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include", // Auth
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to update config");
      }
      return api.battlepass.updateConfig.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.battlepass.getConfig.path] });
      toast({ title: "Config Updated", description: "Season settings saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
    }
  });
}

export function useUpdateLevel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.battlepass.updateLevel.input>) => {
      const url = buildUrl(api.battlepass.updateLevel.path, { id });
      const res = await fetch(url, {
        method: api.battlepass.updateLevel.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update level");
      return api.battlepass.updateLevel.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.battlepass.listLevels.path] });
      toast({ title: "Level Updated", description: "Reward updated successfully." });
    },
  });
}
