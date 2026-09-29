"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAuthenticatedRoute } from "@/features/auth/utils/getAuthenticatedRoute";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    router.push(
      getAuthenticatedRoute({
        isAuthenticated,
        isSuperAdmin: user?.isSuperAdmin ?? false,
        churchId: user?.churchId ?? null,
      }),
    );
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
