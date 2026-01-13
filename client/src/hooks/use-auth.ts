import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { User } from "@shared/models/auth";

const AUTH_TOKEN_KEY = "asylum_auth_token";

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // localStorage might not be available
  }
}

function clearStoredToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

async function fetchUser(): Promise<User | null> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("/api/auth/user", {
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    clearStoredToken();
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function performLogout(): Promise<void> {
  const token = getStoredToken();
  
  if (token) {
    await fetch("/api/logout", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      credentials: "include",
    }).catch(() => {});
  }
  
  clearStoredToken();
  window.location.href = "/";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const tokenProcessed = useRef(false);
  
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (tokenProcessed.current) return;
    
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get("authToken");
    
    if (authToken) {
      tokenProcessed.current = true;
      setStoredToken(authToken);
      window.history.replaceState({}, "", window.location.pathname);
      refetch();
    }
  }, [refetch]);

  const logout = () => {
    queryClient.setQueryData(["/api/auth/user"], null);
    performLogout();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut: false,
  };
}
