"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useChurchStore } from "@/stores/churchStore";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { selectedChurch } = useChurchStore();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (user?.isSuperAdmin || selectedChurch) {
        router.push("/home");
      } else {
        router.push("/select-church");
      }
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
