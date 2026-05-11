import { create } from "zustand";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";

const DEFAULT_TTL_MS = 5 * 60 * 1000;

interface ChurchCatalogState {
  churches: ChurchListItemDTO[];
  isLoading: boolean;
  lastFetchedAt: number | null;
}

interface ChurchCatalogActions {
  fetchIfStale: (ttlMs?: number) => Promise<ChurchListItemDTO[]>;
  invalidate: () => void;
  setChurches: (churches: ChurchListItemDTO[]) => void;
}

type ChurchCatalogStore = ChurchCatalogState & ChurchCatalogActions;

export const useChurchCatalogStore = create<ChurchCatalogStore>((set, get) => ({
  churches: [],
  isLoading: false,
  lastFetchedAt: null,

  fetchIfStale: async (ttlMs = DEFAULT_TTL_MS) => {
    const { churches, isLoading, lastFetchedAt } = get();
    const now = Date.now();
    const isFresh =
      lastFetchedAt !== null &&
      now - lastFetchedAt < ttlMs &&
      churches.length > 0;

    if (isFresh || isLoading) {
      return churches;
    }

    set({ isLoading: true });

    try {
      const response = await fetch("/api/churches");
      const data = await response.json();

      if (!data.ok) {
        return churches;
      }

      const sortedChurches = [...data.value.churches].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      );

      set({
        churches: sortedChurches,
        lastFetchedAt: now,
      });

      return sortedChurches;
    } finally {
      set({ isLoading: false });
    }
  },

  invalidate: () => set({ lastFetchedAt: null }),

  setChurches: (churches) =>
    set({
      churches,
      lastFetchedAt: Date.now(),
    }),
}));
