"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (user?.isSuperAdmin || user?.churchId) {
        router.push("/home");
      } else {
        router.push("/select-church");
      }
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </main>
  );
}
