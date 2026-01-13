import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { User } from "@shared/models/auth";

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function exchangeAuthToken(token: string): Promise<User | null> {
  const response = await fetch("/api/auth/exchange-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user;
}

async function logout(): Promise<void> {
  window.location.href = "/api/logout";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const tokenExchanged = useRef(false);
  
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (tokenExchanged.current) return;
    
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get("authToken");
    
    if (authToken) {
      tokenExchanged.current = true;
      
      window.history.replaceState({}, "", window.location.pathname);
      
      exchangeAuthToken(authToken).then((exchangedUser) => {
        if (exchangedUser) {
          queryClient.setQueryData(["/api/auth/user"], exchangedUser);
        }
        refetch();
      });
    }
  }, [queryClient, refetch]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
