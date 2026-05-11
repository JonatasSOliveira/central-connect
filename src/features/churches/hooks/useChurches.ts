"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useChurchCatalogStore } from "@/stores/churchCatalogStore";

interface UseChurchesReturn {
  churches: ChurchListItemDTO[];
  allChurchesCount: number;
  isLoading: boolean;
  searchQuery: string;
  setSearch: (value: string) => void;
  deleteChurch: (churchId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useChurches(): UseChurchesReturn {
  const { user } = useAuth();
  const { churches: cachedChurches, fetchIfStale, setChurches } =
    useChurchCatalogStore();
  const [allChurches, setAllChurches] = useState<ChurchListItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChurches = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (cachedChurches.length > 0) {
        setAllChurches(cachedChurches);
      }

      const churches = await fetchIfStale();
      if (churches.length > 0) {
        setAllChurches(churches);
      }
    } catch (error) {
      console.error("Error fetching churches:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cachedChurches, fetchIfStale, user]);

  useEffect(() => {
    fetchChurches();
  }, [fetchChurches]);

  const filteredChurches = useMemo(() => {
    if (!searchQuery.trim()) {
      return allChurches;
    }
    const query = searchQuery.toLowerCase().trim();
    return allChurches.filter((church) =>
      church.name.toLowerCase().includes(query),
    );
  }, [allChurches, searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const deleteChurch = useCallback(
    async (churchId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/churches/${churchId}`, {
          method: "DELETE",
        });

        if (response.status === 204) {
          const updatedChurches = allChurches.filter((c) => c.id !== churchId);
          setAllChurches(updatedChurches);
          setChurches(updatedChurches);
          return true;
        }

        const data = await response.json();

        if (data.ok) {
          const updatedChurches = allChurches.filter((c) => c.id !== churchId);
          setAllChurches(updatedChurches);
          setChurches(updatedChurches);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting church:", error);
        return false;
      }
    },
    [allChurches, setChurches],
  );

  return {
    churches: filteredChurches,
    allChurchesCount: allChurches.length,
    isLoading,
    searchQuery,
    setSearch: handleSearch,
    deleteChurch,
    refresh: fetchChurches,
  };
}
