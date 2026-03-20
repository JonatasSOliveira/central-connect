"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface Church {
  id: string;
  name: string;
}

interface UseChurchesReturn {
  churches: Church[];
  isLoading: boolean;
}

export function useChurches(): UseChurchesReturn {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      router.push("/home");
    }
  }, [user, router]);

  return {
    churches: [],
    isLoading: false,
  };
}
