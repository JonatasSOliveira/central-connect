"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useChurchStore } from "@/stores/churchStore";

export function useHomeScreen() {
  const { user } = useAuth();
  const { selectedChurch } = useChurchStore();
  console.log("selectedChurch", selectedChurch);

  return {
    userName: user?.fullName || "Usuário",
    isSuperAdmin: user?.isSuperAdmin ?? false,
    selectedChurch,
  };
}
