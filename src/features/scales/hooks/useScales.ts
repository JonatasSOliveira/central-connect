"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScaleListItemDTO } from "@/application/dtos/scale/ScaleDTO";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UseScalesFilters {
  serviceId?: string;
  ministryId?: string;
}

interface UseScalesReturn {
  scales: ScaleListItemDTO[];
  allScalesCount: number;
  isLoading: boolean;
  searchQuery: string;
  setSearch: (value: string) => void;
  filters: UseScalesFilters;
  setFilters: (filters: UseScalesFilters) => void;
  deleteScale: (scaleId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useScales(): UseScalesReturn {
  const { user } = useAuth();
  const churchId = user?.churchId ?? null;

  const [allScales, setAllScales] = useState<ScaleListItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<UseScalesFilters>({});

  const fetchScales = useCallback(async () => {
    if (!churchId) {
      setAllScales([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("churchId", churchId);
      if (filters.serviceId) {
        params.append("serviceId", filters.serviceId);
      }
      if (filters.ministryId) {
        params.append("ministryId", filters.ministryId);
      }

      const url = `/api/scales?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok) {
        setAllScales(data.value.scales);
      }
    } catch (error) {
      console.error("Error fetching scales:", error);
    } finally {
      setIsLoading(false);
    }
  }, [churchId, filters.serviceId, filters.ministryId]);

  useEffect(() => {
    fetchScales();
  }, [fetchScales]);

  const filteredScales = useMemo(() => {
    if (!searchQuery.trim()) {
      return allScales;
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();

    return allScales.filter((scale) => {
      const searchValues = [
        scale.serviceId,
        scale.ministryId,
        scale.notes ?? "",
        scale.status,
      ];

      return searchValues.some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [allScales, searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSetFilters = useCallback((newFilters: UseScalesFilters) => {
    setFilters(newFilters);
  }, []);

  const deleteScale = useCallback(async (scaleId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/scales/${scaleId}`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        setAllScales((prev) => prev.filter((s) => s.id !== scaleId));
        return true;
      }

      const data = await response.json();

      if (data.ok) {
        setAllScales((prev) => prev.filter((s) => s.id !== scaleId));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting scale:", error);
      return false;
    }
  }, []);

  return {
    scales: filteredScales,
    allScalesCount: allScales.length,
    isLoading,
    searchQuery,
    setSearch: handleSearch,
    filters,
    setFilters: handleSetFilters,
    deleteScale,
    refresh: fetchScales,
  };
}
