"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export type MyScalePeriod = "upcoming" | "past";

export interface MyScaleItem {
  scaleId: string;
  serviceId: string;
  serviceTitle: string;
  serviceDate: string;
  serviceTime: string;
  ministryId: string;
  ministryName: string;
  ministryRoleId: string;
  ministryRoleName: string;
  scaleNotes: string | null;
  memberNotes: string | null;
}

interface UseMyScalesResult {
  period: MyScalePeriod;
  setPeriod: (period: MyScalePeriod) => void;
  scales: MyScaleItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useMyScales(): UseMyScalesResult {
  const { user } = useAuth();
  const churchId = user?.churchId ?? null;
  const [period, setPeriod] = useState<MyScalePeriod>("upcoming");
  const [scales, setScales] = useState<MyScaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyScales = useCallback(async () => {
    setIsLoading(true);

    if (!churchId) {
      setScales([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/my-scales?period=${period}`);
      const data = await response.json();

      if (data.ok) {
        setScales(data.value.scales);
        return;
      }

      setScales([]);
    } catch {
      setScales([]);
    } finally {
      setIsLoading(false);
    }
  }, [churchId, period]);

  useEffect(() => {
    fetchMyScales();
  }, [fetchMyScales]);

  return {
    period,
    setPeriod,
    scales,
    isLoading,
    refresh: fetchMyScales,
  };
}
