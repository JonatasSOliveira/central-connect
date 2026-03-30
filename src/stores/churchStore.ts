import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";

interface ChurchStore {
  selectedChurch: ChurchListItemDTO | null;
  selectChurch: (church: ChurchListItemDTO) => void;
  clearChurch: () => void;
}

export const useChurchStore = create<ChurchStore>()(
  persist(
    (set) => ({
      selectedChurch: null,
      selectChurch: (church) => set({ selectedChurch: church }),
      clearChurch: () => set({ selectedChurch: null }),
    }),
    {
      name: "church-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
