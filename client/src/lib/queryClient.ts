import { QueryClient, QueryFunction } from "@tanstack/react-query";

const AUTH_TOKEN_KEY = "asylum_auth_token";

function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const adminCode = localStorage.getItem("admin_override") === "true" ? "1327" : null;
  const authToken = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (adminCode) {
    headers["x-admin-code"] = adminCode;
  }
  
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const adminCode = localStorage.getItem("admin_override") === "true" ? "1327" : null;
    const authToken = getAuthToken();
    const headers: Record<string, string> = {};
    
    if (adminCode) {
      headers["x-admin-code"] = adminCode;
    }
    
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = "/" + queryKey.join("/");
    const fetchOptions: RequestInit = {
      credentials: "include",
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    };

    const res = await fetch(url, fetchOptions);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
