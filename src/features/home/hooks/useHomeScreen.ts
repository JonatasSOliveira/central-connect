"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";

interface UseHomeScreenReturn {
  userName: string;
}

export function useHomeScreen(): UseHomeScreenReturn {
  const { user } = useAuth();

  return {
    userName: user?.fullName || "Usuário",
  };
}
