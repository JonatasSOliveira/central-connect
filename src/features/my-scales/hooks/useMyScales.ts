"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface MyScaleItem {
  scaleId: string;
  serviceDate: string;
  serviceTime: string;
  ministryName: string;
  ministryRoleName: string;
}

type TabKey = "current" | "past";

interface UseMyScalesReturn {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  isLoading: boolean;
  currentAndFuture: MyScaleItem[];
  past: MyScaleItem[];
}

export function useMyScales(): UseMyScalesReturn {
  const [activeTab, setActiveTab] = useState<TabKey>("current");
  const [isLoading, setIsLoading] = useState(true);
  const [currentAndFuture, setCurrentAndFuture] = useState<MyScaleItem[]>([]);
  const [past, setPast] = useState<MyScaleItem[]>([]);

  const fetchMyScales = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/my-scales");
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setCurrentAndFuture([]);
        setPast([]);
        return;
      }

      setCurrentAndFuture(data.value.currentAndFuture ?? []);
      setPast(data.value.past ?? []);
    } catch {
      setCurrentAndFuture([]);
      setPast([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyScales();
  }, [fetchMyScales]);

  return useMemo(
    () => ({
      activeTab,
      setActiveTab,
      isLoading,
      currentAndFuture,
      past,
    }),
    [activeTab, isLoading, currentAndFuture, past],
  );
}
