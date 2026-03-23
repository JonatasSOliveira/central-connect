"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UseChurchesReturn {
  churches: ChurchListItemDTO[];
  isLoading: boolean;
  deleteChurch: (churchId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useChurches(): UseChurchesReturn {
  const { user } = useAuth();
  const [churches, setChurches] = useState<ChurchListItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChurches = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
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
  }, [user]);

  useEffect(() => {
    fetchChurches();
  }, [fetchChurches]);

  const deleteChurch = useCallback(
    async (churchId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/churches/${churchId}`, {
          method: "DELETE",
        });

        if (response.status === 204) {
          setChurches((prev) => prev.filter((c) => c.id !== churchId));
          return true;
        }

        const data = await response.json();

        if (data.ok) {
          setChurches((prev) => prev.filter((c) => c.id !== churchId));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting church:", error);
        return false;
      }
    },
    [],
  );

  return { churches, isLoading, deleteChurch, refresh: fetchChurches };
}
