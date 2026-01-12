import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

export function useBattlepassConfig() {
  return useQuery({
    queryKey: [api.battlepass.getConfig.path],
    queryFn: async () => {
      const res = await apiRequest("GET", api.battlepass.getConfig.path);
      return api.battlepass.getConfig.responses[200].parse(await res.json());
    },
  });
}

export function useBattlepassLevels() {
  return useQuery({
    queryKey: [api.battlepass.listLevels.path],
    queryFn: async () => {
      const res = await apiRequest("GET", api.battlepass.listLevels.path);
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
      const res = await apiRequest("PATCH", api.battlepass.updateConfig.path, data);
      return api.battlepass.updateConfig.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.battlepass.getConfig.path] });
      toast({ title: "Config Updated", description: "Season settings saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update settings.", variant: "destructive" });
    }
  });
}

export function useUpdateLevel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.battlepass.updateLevel.input>) => {
      const url = buildUrl(api.battlepass.updateLevel.path, { id });
      const res = await apiRequest("PATCH", url, data);
      return api.battlepass.updateLevel.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.battlepass.listLevels.path] });
      toast({ title: "Level Updated", description: "Reward updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update level.", variant: "destructive" });
    }
  });
}
