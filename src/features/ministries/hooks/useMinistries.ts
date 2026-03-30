"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MinistryListItemDTO } from "@/application/dtos/ministry/MinistryDTO";
import { useChurchStore } from "@/stores/churchStore";

interface UseMinistriesReturn {
  ministries: MinistryListItemDTO[];
  allMinistriesCount: number;
  isLoading: boolean;
  searchQuery: string;
  setSearch: (value: string) => void;
  deleteMinistry: (ministryId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useMinistries(): UseMinistriesReturn {
  const { selectedChurch } = useChurchStore();
  const churchId = selectedChurch?.id;

  const [allMinistries, setAllMinistries] = useState<MinistryListItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMinistries = useCallback(async () => {
    if (!churchId) {
      setAllMinistries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = `/api/ministries?churchId=${churchId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok) {
        const sorted = [...data.value.ministries].sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR"),
        );
        setAllMinistries(sorted);
      }
    } catch (error) {
      console.error("Error fetching ministries:", error);
    } finally {
      setIsLoading(false);
    }
  }, [churchId]);

  useEffect(() => {
    fetchMinistries();
  }, [fetchMinistries]);

  const filteredMinistries = useMemo(() => {
    if (!searchQuery.trim()) {
      return allMinistries;
    }
    const query = searchQuery.toLowerCase().trim();
    return allMinistries.filter((ministry) =>
      ministry.name.toLowerCase().includes(query),
    );
  }, [allMinistries, searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const deleteMinistry = useCallback(
    async (ministryId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/ministries/${ministryId}`, {
          method: "DELETE",
        });

        if (response.status === 204) {
          setAllMinistries((prev) => prev.filter((m) => m.id !== ministryId));
          return true;
        }

        const data = await response.json();

        if (data.ok) {
          setAllMinistries((prev) => prev.filter((m) => m.id !== ministryId));
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

  return {
    ministries: filteredMinistries,
    allMinistriesCount: allMinistries.length,
    isLoading,
    searchQuery,
    setSearch: handleSearch,
    deleteMinistry,
    refresh: fetchMinistries,
  };
}
