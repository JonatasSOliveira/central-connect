"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getCurrentUserToken,
  getGoogleRedirectUser,
  signInWithGoogleRedirect,
} from "@/infra/firebase-client/services/googleAuth";
import { useAuthStore } from "@/stores/authStore";

const GOOGLE_LOGIN_PENDING_KEY = "google-login-pending";
const GOOGLE_LOGIN_PENDING_TS_KEY = "google-login-pending-ts";
const GOOGLE_LOGIN_PENDING_WINDOW_MS = 10 * 60 * 1000;

interface UseLoginScreenReturn {
  isLoading: boolean;
  error: string | null;
  handleGoogleLogin: () => Promise<void>;
}

const AUTH_DEBUG_ENABLED =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";

function authDebug(message: string, payload?: unknown): void {
  if (!AUTH_DEBUG_ENABLED) {
    return;
  }

  if (payload !== undefined) {
    console.log(`[auth-debug] ${message}`, payload);
    return;
  }

  console.log(`[auth-debug] ${message}`);
}

export function useLoginScreen(): UseLoginScreenReturn {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearPendingGoogleRedirect = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
    window.localStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
    window.localStorage.removeItem(GOOGLE_LOGIN_PENDING_TS_KEY);
    authDebug("pending redirect cleared");
  }, []);

  const setPendingGoogleRedirect = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const now = Date.now().toString();
    window.sessionStorage.setItem(GOOGLE_LOGIN_PENDING_KEY, "1");
    window.localStorage.setItem(GOOGLE_LOGIN_PENDING_KEY, "1");
    window.localStorage.setItem(GOOGLE_LOGIN_PENDING_TS_KEY, now);
    authDebug("pending redirect set", { now });
  }, []);

  const hasPendingGoogleRedirect = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const pendingInSession =
      window.sessionStorage.getItem(GOOGLE_LOGIN_PENDING_KEY) === "1";

    if (pendingInSession) {
      return true;
    }

    const pendingInLocal =
      window.localStorage.getItem(GOOGLE_LOGIN_PENDING_KEY) === "1";
    const pendingTs = Number(
      window.localStorage.getItem(GOOGLE_LOGIN_PENDING_TS_KEY) ?? "0",
    );

    if (!pendingInLocal || !Number.isFinite(pendingTs)) {
      return false;
    }

    const isFresh = Date.now() - pendingTs <= GOOGLE_LOGIN_PENDING_WINDOW_MS;
    authDebug("pending redirect check", {
      pendingInSession,
      pendingInLocal,
      pendingTs,
      isFresh,
      now: Date.now(),
    });

    if (!isFresh) {
      clearPendingGoogleRedirect();
      return false;
    }

    return true;
  }, [clearPendingGoogleRedirect]);

  useEffect(() => {
    const processRedirectLogin = async () => {
      try {
        const pendingRedirect = hasPendingGoogleRedirect();
        authDebug("processRedirectLogin start", { pendingRedirect });
        const redirectUser = await getGoogleRedirectUser();
        authDebug("getGoogleRedirectUser", {
          hasUser: Boolean(redirectUser),
          uid: redirectUser?.uid ?? null,
        });

        if (!redirectUser && pendingRedirect) {
          const idToken = await getCurrentUserToken();
          authDebug("fallback getCurrentUserToken", {
            hasToken: Boolean(idToken),
          });

          if (!idToken) {
            clearPendingGoogleRedirect();
            setError(
              "Não foi possível concluir o login com Google. Tente novamente.",
            );
            return;
          }

          const result = await login(idToken);
          authDebug("login with fallback token", {
            errorMessage: result.errorMessage,
          });

          if (result.errorMessage) {
            setError(result.errorMessage);
            clearPendingGoogleRedirect();
            return;
          }

          clearPendingGoogleRedirect();
          router.replace("/select-church");
          return;
        }

        if (!redirectUser) {
          return;
        }

        const result = await login(redirectUser.idToken);
        authDebug("login with redirect token", {
          errorMessage: result.errorMessage,
        });

        if (result.errorMessage) {
          setError(result.errorMessage);
          clearPendingGoogleRedirect();
          return;
        }

        clearPendingGoogleRedirect();
        router.replace("/select-church");
      } catch (err) {
        authDebug("processRedirectLogin error", err);
        const message =
          err instanceof Error ? err.message : "Erro ao processar login";
        setError(message);
        clearPendingGoogleRedirect();
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    processRedirectLogin();
  }, [clearPendingGoogleRedirect, hasPendingGoogleRedirect, login, router]);

  const handleGoogleLogin = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    authDebug("handleGoogleLogin click", {
      href: typeof window !== "undefined" ? window.location.href : null,
    });

    try {
      setPendingGoogleRedirect();
      authDebug("calling signInWithGoogleRedirect");
      await signInWithGoogleRedirect();
    } catch (err) {
      authDebug("signInWithGoogleRedirect error", err);
      clearPendingGoogleRedirect();
      const message =
        err instanceof Error ? err.message : "Erro ao fazer login";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [clearPendingGoogleRedirect, setPendingGoogleRedirect]);

  return {
    isLoading: isSubmitting || isProcessingRedirect,
    error,
    handleGoogleLogin,
  };
}
