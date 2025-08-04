import { supabase } from "./supabase";

// A custom hook to create a pre-configured API client
export const useApiClient = () => {
  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const callApi = async (method: string, endpoint: string, body?: any) => {
    const token = await getAccessToken();
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method: method.toUpperCase(),
      headers,
    };

    if (body) {
      if (body instanceof FormData) {
        config.body = body;
      } else {
        headers["Content-Type"] = "application/json";
        config.body = JSON.stringify(body);
      }
    }

    const response = await fetch(`${baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const raw = async (endpoint: string): Promise<Response> => {
    const accessToken = await getAccessToken();
    
    const headers: HeadersInit = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}${endpoint}`, {
      headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  };

  return {
    get: (endpoint: string) => callApi('get', endpoint),
    post: (endpoint: string, body: any) => callApi('post', endpoint, body),
    put: (endpoint: string, body: any) => callApi('put', endpoint, body),
    delete: (endpoint: string) => callApi('delete', endpoint),
    raw,
  };
};
