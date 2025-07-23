import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
  const token = localStorage.getItem("adminToken");
  const headers: Record<string, string> = {};

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  if (token && url.startsWith("/api/admin/")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // In production, ensure we're using the correct base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  // Only log in development for debugging
  if (import.meta.env.MODE === 'development') {
    console.log("🌐 Fetch request:", { url, fullUrl, baseUrl });
  }

  const res = await fetch(fullUrl, {
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
    const url = queryKey[0] as string;
    const token = localStorage.getItem("adminToken");
    const headers: Record<string, string> = {};

    if (token && url.startsWith("/api/admin/")) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // In production, ensure we're using the correct base URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    // Only log in development for debugging
    if (import.meta.env.MODE === 'development') {
      console.log("🔍 Query fetch:", { url, fullUrl, baseUrl });
    }

    const res = await fetch(fullUrl, {
      cache: 'no-store', // Prevent caching issues in deployment
      credentials: "include",
      headers,
    });

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
      staleTime: 5 * 60 * 1000, // 5 minutes instead of infinity
      retry: 3, // Enable retry for better deployment reliability
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});