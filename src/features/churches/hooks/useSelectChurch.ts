import { useEffect, useState } from "react";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import { authService } from "@/application/services/AuthService";
import type { ListChurchesOutput } from "@/application/use-cases/church/ListChurches";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Result } from "@/shared/types/Result";

interface SelectChurchScreenParams {
  goToHome: () => void;
}

export function useSelectChurchScreen({ goToHome }: SelectChurchScreenParams) {
  const { isLoading, initialize } = useAuth();
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
    await authService.selectChurch(church.id);
    await initialize();
    goToHome();
  };

  return {
    churches,
    loadingChurches,
    isLoading,
    handleSelectChurch,
    showLogoutDialog,
    setShowLogoutDialog,
  };
}
