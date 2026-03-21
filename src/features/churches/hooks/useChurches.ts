"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UseChurchesReturn {
  churches: ChurchListItemDTO[];
  isLoading: boolean;
}

export function useChurches(): UseChurchesReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [churches, setChurches] = useState<ChurchListItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      router.push("/home");
      return;
    }

    if (!user) return;

    const fetchChurches = async () => {
      try {
        const response = await fetch("/api/churches");
        const data = await response.json();

        if (data.ok) {
          setChurches(data.value.churches);
        }
      } catch (error) {
        console.error("Error fetching churches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChurches();
  }, [user, router]);

  return { churches, isLoading };
}
