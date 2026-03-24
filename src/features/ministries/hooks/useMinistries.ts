"use client";

import { useCallback, useEffect, useState } from "react";
import type { MinistryListItemDTO } from "@/application/dtos/ministry/MinistryDTO";
import { useAuthStore } from "@/stores/authStore";

interface UseMinistriesReturn {
  ministries: MinistryListItemDTO[];
  isLoading: boolean;
  deleteMinistry: (ministryId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useMinistries(): UseMinistriesReturn {
  const { user } = useAuthStore();
  const [ministries, setMinistries] = useState<MinistryListItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMinistries = useCallback(async () => {
    if (!user) return;

    const churchId = user.churches[0]?.churchId;
    if (!churchId) {
      setMinistries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/ministries?churchId=${churchId}`);
      const data = await response.json();

      if (data.ok) {
        setMinistries(data.value.ministries);
      }
    } catch (error) {
      console.error("Error fetching ministries:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMinistries();
  }, [fetchMinistries]);

  const deleteMinistry = useCallback(
    async (ministryId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/ministries/${ministryId}`, {
          method: "DELETE",
        });

        if (response.status === 204) {
          setMinistries((prev) => prev.filter((m) => m.id !== ministryId));
          return true;
        }

        const data = await response.json();

        if (data.ok) {
          setMinistries((prev) => prev.filter((m) => m.id !== ministryId));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting ministry:", error);
        return false;
      }
    },
    [],
  );

  return { ministries, isLoading, deleteMinistry, refresh: fetchMinistries };
}
