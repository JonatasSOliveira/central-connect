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
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const fetchServices = useCallback(async () => {
    if (!churchId) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ churchId });

      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }
      if (endDate) {
        params.append("endDate", endDate.toISOString());
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
  }, [churchId, startDate, endDate]);

  useEffect(() => {
    if (!churchId) {
      setServices([]);
      setIsLoading(false);
      return;
    }

    fetchServices();
  }, [churchId, fetchServices]);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }

    const query = searchQuery.toLowerCase().trim();
    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(query) ||
        service.location?.toLowerCase().includes(query) ||
        service.shift?.toLowerCase().includes(query),
    );
  }, [services, searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleStartDateChange = useCallback((date: Date | undefined) => {
    setStartDate(date);
  }, []);

  const handleEndDateChange = useCallback((date: Date | undefined) => {
    setEndDate(date);
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
    startDate,
    endDate,
    setSearch: handleSearch,
    setStartDate: handleStartDateChange,
    setEndDate: handleEndDateChange,
    refresh: fetchServices,
    deleteService,
  };
}
