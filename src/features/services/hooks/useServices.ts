"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatServiceDate } from "../utils/service-date";

export interface ServiceListItem {
  id: string;
  churchId: string;
  serviceTemplateId: string | null;
  title: string;
  date: string;
  time: string;
  location: string | null;
  description: string | null;
  createdAt: string;
}

export function useServices() {
  const { user } = useAuth();
  const churchId = user?.churchId ?? null;

  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: undefined,
    endDate: undefined,
  });

  const fetchServices = useCallback(async () => {
    if (!churchId) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.startDate) {
        params.append("startDate", formatServiceDate(filters.startDate));
      }
      if (filters.endDate) {
        params.append("endDate", formatServiceDate(filters.endDate));
      }

      const response = await fetch(`/api/services?${params.toString()}`);
      const data = await response.json();

      if (data.ok) {
        setServices(data.value.services as ServiceListItem[]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  }, [churchId, filters.startDate, filters.endDate]);

  useEffect(() => {
    if (!churchId) {
      setServices([]);
      setIsLoading(false);
      return;
    }

    fetchServices();
  }, [churchId, fetchServices]);

  const applyFilters = useCallback(
    (startDate: Date | undefined, endDate: Date | undefined) => {
      setFilters((currentFilters) => {
        const currentStart = currentFilters.startDate
          ? formatServiceDate(currentFilters.startDate)
          : undefined;
        const currentEnd = currentFilters.endDate
          ? formatServiceDate(currentFilters.endDate)
          : undefined;
        const nextStart = startDate ? formatServiceDate(startDate) : undefined;
        const nextEnd = endDate ? formatServiceDate(endDate) : undefined;

        if (currentStart === nextStart && currentEnd === nextEnd) {
          return currentFilters;
        }

        return { startDate, endDate };
      });
    },
    [],
  );

  const filteredServices = useMemo(() => {
    let result = services;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (service) =>
          service.title.toLowerCase().includes(query) ||
          service.location?.toLowerCase().includes(query),
      );
    }

    return [...result].sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);
      return dateComparison || a.time.localeCompare(b.time);
    });
  }, [services, searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const deleteService = useCallback(
    async (serviceId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/services/${serviceId}`, {
          method: "DELETE",
        });

        if (response.status === 204 || response.ok) {
          setServices((prev) => prev.filter((s) => s.id !== serviceId));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting service:", error);
        return false;
      }
    },
    [],
  );

  return {
    services: filteredServices,
    allServicesCount: services.length,
    isLoading,
    searchQuery,
    filters,
    setSearch: handleSearch,
    applyFilters,
    refresh: fetchServices,
    deleteService,
  };
}
