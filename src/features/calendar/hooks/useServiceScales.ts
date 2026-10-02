"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export interface ServiceScaleSummary {
  id: string;
  serviceId: string;
  ministryId: string;
  ministryName: string;
  memberCount: number;
  status: "draft" | "published";
  notes: string | null;
}

export function useServiceScales(serviceId?: string) {
  const { user } = useAuth();
  const [scales, setScales] = useState<ServiceScaleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!serviceId || !user?.churchId) {
      setScales([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        churchId: user.churchId,
        serviceId,
      });
      const response = await fetch(`/api/scales?${params.toString()}`);
      const data = await response.json();
      if (!data.ok) {
        setError(data.error?.message ?? "Não foi possível carregar as escalas.");
        return;
      }
      setScales((data.value?.scales ?? []) as ServiceScaleSummary[]);
    } catch {
      setError("Não foi possível carregar as escalas.");
    } finally {
      setIsLoading(false);
    }
  }, [serviceId, user?.churchId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const deleteScale = useCallback(async (scaleId: string) => {
    const response = await fetch(`/api/scales/${scaleId}`, { method: "DELETE" });
    return response.ok || response.status === 204;
  }, []);

  return { scales, isLoading, error, refresh, deleteScale };
}
