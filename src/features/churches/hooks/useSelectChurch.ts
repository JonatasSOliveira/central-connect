import { useEffect, useState } from "react";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import type { ListChurchesOutput } from "@/application/use-cases/church/ListChurches";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Result } from "@/shared/types/Result";
import { useChurchStore } from "@/stores/churchStore";

interface SelectChurchScreenParams {
  goToHome: () => void;
}

export function useSelectChurchScreen({ goToHome }: SelectChurchScreenParams) {
  const { isLoading } = useAuth();
  const { selectChurch } = useChurchStore();
  const [churches, setChurches] = useState<ChurchListItemDTO[]>([]);
  const [loadingChurches, setLoadingChurches] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const loadChurches = async () => {
      try {
        const response = await fetch("/api/churches");
        const data: Result<ListChurchesOutput> = await response.json();
        if (!data.ok) {
          return;
        }

        setChurches(data.value.churches);
      } finally {
        setLoadingChurches(false);
      }
    };

    loadChurches();
  }, []);

  const handleSelectChurch = async (church: ChurchListItemDTO) => {
    selectChurch(church);
    goToHome();
  };

  return {
    churches,
    loadingChurches,
    isLoading,
    handleSelectChurch,
    selectChurch,
    showLogoutDialog,
    setShowLogoutDialog,
  };
}
