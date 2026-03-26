import { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
