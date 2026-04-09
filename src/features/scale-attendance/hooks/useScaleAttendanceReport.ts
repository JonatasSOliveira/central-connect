"use client";

import { useCallback, useEffect, useState } from "react";
import { getScaleAttendanceReport } from "../services/scaleAttendanceApi";
import type {
  ScaleAttendanceReportItem,
  ScaleAttendanceReportMinistryOption,
  ScaleAttendanceReportSummary,
} from "../types";

interface ReportFilters {
  startDate: string;
  endDate: string;
  ministryId?: string;
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultFilters(): ReportFilters {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    startDate: toDateInputValue(firstDayOfMonth),
    endDate: toDateInputValue(now),
    ministryId: undefined,
  };
}

const EMPTY_SUMMARY: ScaleAttendanceReportSummary = {
  scaleCount: 0,
  memberCount: 0,
  checkedCount: 0,
  pendingCount: 0,
  presentCount: 0,
  absentUnexcusedCount: 0,
  absentExcusedCount: 0,
  publishedCount: 0,
  draftCount: 0,
  completionRate: 0,
};

export function useScaleAttendanceReport(churchId: string | null) {
  const [filters, setFilters] = useState<ReportFilters>(getDefaultFilters);
  const [summary, setSummary] =
    useState<ScaleAttendanceReportSummary>(EMPTY_SUMMARY);
  const [items, setItems] = useState<ScaleAttendanceReportItem[]>([]);
  const [ministries, setMinistries] = useState<
    ScaleAttendanceReportMinistryOption[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!churchId) {
      setSummary(EMPTY_SUMMARY);
      setItems([]);
      setMinistries([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getScaleAttendanceReport({
        churchId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        ministryId: filters.ministryId,
      });

      setSummary(response.summary);
      setItems(response.items);
      setMinistries(response.ministries);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Falha ao carregar relatório de chamadas";
      setError(message);
      setSummary(EMPTY_SUMMARY);
      setItems([]);
      setMinistries([]);
    } finally {
      setIsLoading(false);
    }
  }, [churchId, filters.endDate, filters.ministryId, filters.startDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const applyFilters = useCallback((nextFilters: ReportFilters) => {
    setFilters({
      startDate: nextFilters.startDate,
      endDate: nextFilters.endDate,
      ministryId: nextFilters.ministryId || undefined,
    });
  }, []);

  return {
    filters,
    summary,
    items,
    ministries,
    isLoading,
    error,
    applyFilters,
    refresh: fetchReport,
  };
}
