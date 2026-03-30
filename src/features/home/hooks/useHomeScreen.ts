"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useChurchStore } from "@/stores/churchStore";

export function useHomeScreen() {
  const { user } = useAuth();
  const { selectedChurch } = useChurchStore();

  return {
    userName: user?.fullName || "Usuário",
    avatarUrl: user?.avatarUrl || null,
    isSuperAdmin: user?.isSuperAdmin ?? false,
    selectedChurch,
  };
}

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
