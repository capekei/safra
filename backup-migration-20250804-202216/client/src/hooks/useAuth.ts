import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profileImageUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
}

// Simple in-memory auth state for now
let authState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

// For development, we can simulate a logged-in user
const DEV_USER: User = {
  id: 'dev-user-1',
  email: 'dev@safrareport.com',
  firstName: 'Desarrollo',
  lastName: 'Usuario',
  role: 'user', // or 'admin' for testing admin features
};

export function useAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>(authState);

  useEffect(() => {
    // Simulate checking for existing auth on mount
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Check localStorage for auth token (simple implementation)
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    setTimeout(() => {
      if (token && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          authState = {
            user,
            isAuthenticated: true,
            isLoading: false,
          };
          setState(authState);
        } catch (error) {
          // Invalid stored data, clear it
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          authState = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
          };
          setState(authState);
        }
      } else {
        authState = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
        };
        setState(authState);
      }
    }, 100); // Simulate network delay
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'dev@safrareport.com' && password === 'dev123') {
          // Successful login
          const user = { ...DEV_USER, email };
          authState = {
            user,
            isAuthenticated: true,
            isLoading: false,
          };
          
          // Store in localStorage
          localStorage.setItem('auth_token', 'dev-token-123');
          localStorage.setItem('auth_user', JSON.stringify(user));
          
          setState(authState);
          resolve();
        } else {
          // Failed login
          authState = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
          };
          setState(authState);
          reject(new Error('Credenciales inválidas'));
        }
      }, 1000);
    });
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password && firstName && lastName) {
          // Successful registration
          const user: User = {
            id: `user-${Date.now()}`,
            email,
            firstName,
            lastName,
            role: 'user',
          };
          
          authState = {
            user,
            isAuthenticated: true,
            isLoading: false,
          };
          
          // Store in localStorage
          localStorage.setItem('auth_token', `token-${Date.now()}`);
          localStorage.setItem('auth_user', JSON.stringify(user));
          
          setState(authState);
          resolve();
        } else {
          authState = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
          };
          setState(authState);
          reject(new Error('Todos los campos son requeridos'));
        }
      }, 1000);
    });
  };

  const logout = (): void => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
    setState(authState);
  };

  return {
    ...state,
    login,
    logout,
    register,
  };
}