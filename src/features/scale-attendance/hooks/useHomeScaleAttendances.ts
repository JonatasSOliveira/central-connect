"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getScaleAttendancesForHome } from "../services/scaleAttendanceApi";
import type {
  AttendanceTimelineFilter,
  ScaleAttendanceHomeItem,
} from "../types";

export function useHomeScaleAttendances(churchId: string | null) {
  const [filter, setFilter] = useState<AttendanceTimelineFilter>("today");
  const [items, setItems] = useState<ScaleAttendanceHomeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!churchId) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getScaleAttendancesForHome(churchId, filter);
      setItems(response);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Falha ao carregar chamadas";
      setError(message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [churchId, filter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const title = useMemo(() => {
    if (filter === "today") return "Chamadas de Hoje";
    if (filter === "upcoming") return "Próximas Chamadas";
    return "Chamadas Atrasadas";
  }, [filter]);

  return {
    filter,
    setFilter,
    items,
    title,
    isLoading,
    error,
    refresh: fetchItems,
  };
}
