import { create } from "zustand";
import type { RoleListItem } from "@/modules/roles/presentation/contracts/role/ListRolesDTO";

const DEFAULT_TTL_MS = 5 * 60 * 1000;

let inFlightRequest: Promise<RoleListItem[]> | null = null;

interface RoleCatalogState {
  roles: RoleListItem[];
  isLoading: boolean;
  lastFetchedAt: number | null;
}

interface RoleCatalogActions {
  fetchIfStale: (ttlMs?: number) => Promise<RoleListItem[]>;
  invalidate: () => void;
  setRoles: (roles: RoleListItem[]) => void;
}

type RoleCatalogStore = RoleCatalogState & RoleCatalogActions;

export const useRoleCatalogStore = create<RoleCatalogStore>((set, get) => ({
  roles: [],
  isLoading: false,
  lastFetchedAt: null,

  fetchIfStale: async (ttlMs = DEFAULT_TTL_MS) => {
    const { roles, lastFetchedAt } = get();
    const now = Date.now();
    const isFresh = lastFetchedAt !== null && now - lastFetchedAt < ttlMs;

    if (isFresh) {
      return roles;
    }

    if (inFlightRequest) {
      return inFlightRequest;
    }

    const request = (async () => {
      set({ isLoading: true });

      try {
        const response = await fetch("/api/roles");
        const data = await response.json();

        if (!data.ok) {
          return roles;
        }

        const sortedRoles = [...data.value.roles].sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR"),
        );

        set({
          roles: sortedRoles,
          lastFetchedAt: Date.now(),
        });

        return sortedRoles;
      } finally {
        set({ isLoading: false });
      }
    })();

    inFlightRequest = request;

    try {
      return await request;
    } finally {
      if (inFlightRequest === request) {
        inFlightRequest = null;
      }
    }
  },

  invalidate: () => set({ lastFetchedAt: null }),

  setRoles: (roles) =>
    set({
      roles,
      lastFetchedAt: Date.now(),
    }),
}));
