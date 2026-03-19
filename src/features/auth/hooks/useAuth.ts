import { useEffect } from "react";
import type { CurrentUser } from "@/application/services/AuthService";
import { useAuthStore } from "@/stores/authStore";

interface UseAuthReturn {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (googleToken: string) => Promise<void>;
  logout: () => Promise<void>;
  selectChurch: (churchId: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const {
    user,
    isLoading,
    isInitialized,
    login,
    logout,
    selectChurch,
    initialize,
  } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    selectChurch,
  };
}
