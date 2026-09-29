"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ChurchListItemDTO } from "@/modules/churches/presentation/contracts/church/ChurchDTO";
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
  const { user, isInitialized } = useAuth();
  const { fetchIfStale, setChurches } = useChurchCatalogStore();
  const [allChurches, setAllChurches] = useState<ChurchListItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    let cancelled = false;

    const loadChurches = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const churches = await fetchIfStale();

        if (!cancelled) {
          setAllChurches(churches);
        }
      } catch (error) {
        console.error("Error fetching churches:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadChurches();

    return () => {
      cancelled = true;
    };
  }, [fetchIfStale, isInitialized, user]);

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

  const refresh = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);

    try {
      const churches = await fetchIfStale(0);
      setAllChurches(churches);
    } catch (error) {
      console.error("Error refreshing churches:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchIfStale, user]);

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
    refresh,
  };
}
