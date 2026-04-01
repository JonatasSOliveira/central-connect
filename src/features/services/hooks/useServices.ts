"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useChurchStore } from "@/stores/churchStore";

export interface ServiceListItem {
  id: string;
  churchId: string;
  serviceTemplateId: string | null;
  title: string;
  date: string;
  time: string;
  shift: string | null;
  location: string | null;
  description: string | null;
}

export function useServices() {
  const { selectedChurch } = useChurchStore();
  const churchId = selectedChurch?.id;

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
      const params = new URLSearchParams({ churchId });

      if (filters.startDate) {
        params.append("startDate", filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate.toISOString());
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
      setFilters({ startDate, endDate });
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
          service.location?.toLowerCase().includes(query) ||
          service.shift?.toLowerCase().includes(query),
      );
    }

    return result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
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
