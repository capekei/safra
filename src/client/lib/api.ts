// Simple API client without Supabase dependency
export const useApiClient = () => {
  const getAccessToken = async () => {
    // Get token from localStorage or sessionStorage
    return localStorage.getItem('access_token') || null;
  };

  const callApi = async (method: string, endpoint: string, body?: any) => {
    const token = await getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`/api${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  return {
    get: (endpoint: string) => callApi('GET', endpoint),
    post: (endpoint: string, body?: any) => callApi('POST', endpoint, body),
    put: (endpoint: string, body?: any) => callApi('PUT', endpoint, body),
    delete: (endpoint: string) => callApi('DELETE', endpoint),
  };
};

// Simple auth functions
export const auth = {
  signIn: async (email: string, password: string) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Sign in failed');
    }
    
    const data = await response.json();
    
    if (data.session?.access_token) {
      localStorage.setItem('access_token', data.session.access_token);
    }
    
    return data;
  },

  signOut: async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    localStorage.removeItem('access_token');
  },

  getSession: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
      const response = await fetch('/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        localStorage.removeItem('access_token');
        return null;
      }
      
      const user = await response.json();
      return { user, access_token: token };
    } catch {
      localStorage.removeItem('access_token');
      return null;
    }
  }
};