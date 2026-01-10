import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useServers() {
  return useQuery({
    queryKey: [api.servers.list.path],
    queryFn: async () => {
      const res = await fetch(api.servers.list.path);
      if (!res.ok) throw new Error("Failed to fetch servers");
      return api.servers.list.responses[200].parse(await res.json());
    },
  });
}
