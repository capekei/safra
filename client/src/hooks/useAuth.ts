import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useEffect, useState } from "react";

export function useAuth() {
  const [mockUser, setMockUser] = useState<User | null>(null);
  
  // Check for mock auth
  useEffect(() => {
    const mockAuth = localStorage.getItem('mockAuth');
    if (mockAuth) {
      try {
        const { user } = JSON.parse(mockAuth);
        setMockUser(user);
      } catch (e) {
        console.error('Error parsing mock auth:', e);
      }
    }
  }, []);

  const { data: apiUser, isLoading: apiLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !mockUser, // Only run if no mock user
  });

  const user = mockUser || apiUser;
  const isLoading = !mockUser && apiLoading;
  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}