import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const { user, isLoading, isInitialized, login, logout, initialize } =
    useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    login,
    logout,
    initialize,
  };
}
