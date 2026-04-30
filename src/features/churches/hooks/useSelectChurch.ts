import { useEffect, useState } from "react";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import { authService } from "@/application/services/AuthService";
import type { ListChurchesOutput } from "@/application/use-cases/church/ListChurches";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getPushToken } from "@/infra/firebase-client/services/pushMessaging";
import type { Result } from "@/shared/types/Result";

const PUSH_DEBUG_ENABLED = process.env.NEXT_PUBLIC_PUSH_DEBUG === "true";

function tokenPreview(token: string): string {
  if (token.length <= 12) {
    return token;
  }

  return `${token.slice(0, 6)}...${token.slice(-6)}`;
}

function pushDebug(message: string, payload?: unknown): void {
  if (!PUSH_DEBUG_ENABLED) {
    return;
  }

  if (payload !== undefined) {
    console.log(`[push-debug][select-church] ${message}`, payload);
    return;
  }

  console.log(`[push-debug][select-church] ${message}`);
}

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
    pushDebug("select church start", { churchId: church.id });
    const selectChurchResult = await authService.selectChurch(church.id);
    pushDebug("select church response", {
      churchId: church.id,
      ok: selectChurchResult.ok,
      errorCode: selectChurchResult.ok ? null : selectChurchResult.error.code,
      errorMessage: selectChurchResult.ok
        ? null
        : selectChurchResult.error.message,
    });

    if (!selectChurchResult.ok) {
      return;
    }

    pushDebug("select church session updated", { churchId: church.id });

    try {
      const { token, deviceId } = await getPushToken();
      pushDebug("getPushToken after select church", {
        hasToken: Boolean(token),
        token: token ? tokenPreview(token) : null,
        deviceId,
      });

      if (token) {
        const response = await fetch("/api/push-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, deviceId, platform: "web" }),
        });

        let responseBody: unknown = null;
        try {
          responseBody = await response.json();
        } catch {
          responseBody = null;
        }

        pushDebug("save token after select church", {
          status: response.status,
          ok: response.ok,
          responseBody,
        });
      }
    } catch (error) {
      pushDebug("save token after select church failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

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
