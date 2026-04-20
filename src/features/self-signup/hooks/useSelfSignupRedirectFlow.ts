"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUserToken,
  getGoogleRedirectUser,
} from "@/infra/firebase-client/services/googleAuth";
import {
  clearSelfSignupRedirectPayload,
  getSelfSignupRedirectPayload,
  type SelfSignupRedirectPayload,
} from "./selfSignupRedirectStorage";

interface UseSelfSignupRedirectFlowParams {
  churchId: string;
  finalizeSignupWithToken: (
    googleToken: string,
    payload: SelfSignupRedirectPayload,
  ) => Promise<void>;
  onError: (message: string) => void;
}

export function isLocalhostRuntime(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

async function waitForCurrentUserToken(
  tries = 8,
  delayMs = 350,
): Promise<string | null> {
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    const token = await getCurrentUserToken();

    if (token) {
      return token;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return null;
}

export function useSelfSignupRedirectFlow({
  churchId,
  finalizeSignupWithToken,
  onError,
}: UseSelfSignupRedirectFlowParams): { isProcessingRedirect: boolean } {
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  useEffect(() => {
    const processRedirectFinalize = async () => {
      if (isLocalhostRuntime()) {
        clearSelfSignupRedirectPayload();
        setIsProcessingRedirect(false);
        return;
      }

      try {
        const pending = getSelfSignupRedirectPayload();

        if (!pending) {
          setIsProcessingRedirect(false);
          return;
        }

        if (pending.churchId !== churchId) {
          clearSelfSignupRedirectPayload();
          setIsProcessingRedirect(false);
          return;
        }

        const redirectUser = await getGoogleRedirectUser();
        const token =
          redirectUser?.idToken ?? (await waitForCurrentUserToken());

        if (!token) {
          throw new Error("Não foi possível concluir o login com Google");
        }

        await finalizeSignupWithToken(token, pending);
        clearSelfSignupRedirectPayload();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Não foi possível finalizar";
        onError(message);
        clearSelfSignupRedirectPayload();
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    processRedirectFinalize();
  }, [churchId, finalizeSignupWithToken, onError]);

  return { isProcessingRedirect };
}
