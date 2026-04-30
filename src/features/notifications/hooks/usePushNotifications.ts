"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getPushToken,
  getStoredPushToken,
  isPushSupported,
  onForegroundPush,
  requestNotificationPermission,
} from "@/infra/firebase-client/services/pushMessaging";

interface UsePushNotificationsResult {
  isSupported: boolean;
  permission: NotificationPermission;
  isRegistering: boolean;
  enableNotifications: () => Promise<boolean>;
  autoEnableNotificationsAfterLogin: () => Promise<boolean>;
  syncRegisteredToken: () => Promise<void>;
}

interface UsePushNotificationsOptions {
  enableForegroundListener?: boolean;
}

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
    console.log(`[push-debug][client] ${message}`, payload);
    return;
  }

  console.log(`[push-debug][client] ${message}`);
}

export function usePushNotifications(
  options?: UsePushNotificationsOptions,
): UsePushNotificationsResult {
  const AUTO_PROMPT_COOLDOWN_MS = 1000 * 60 * 60 * 24;
  const AUTO_PROMPT_TS_KEY = "cc:push-auto-prompt-ts";
  const enableForegroundListener = options?.enableForegroundListener ?? true;
  const [isSupportedState, setIsSupportedState] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRegistering, setIsRegistering] = useState(false);
  const registerInFlightRef = useRef<Promise<boolean> | null>(null);
  const lastRegisterFailureRef = useRef<string | null>(null);

  const registerTokenWithRetry = useCallback(async (): Promise<boolean> => {
    if (registerInFlightRef.current) {
      pushDebug("registerToken dedup: using in-flight request");
      return registerInFlightRef.current;
    }

    const run = (async () => {
      const retryDelaysMs = [0, 300, 700, 1500];
      lastRegisterFailureRef.current = null;

    for (let attempt = 1; attempt <= retryDelaysMs.length; attempt += 1) {
      const delayMs = retryDelaysMs[attempt - 1];

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      pushDebug("registerToken attempt", {
        attempt,
        maxAttempts: retryDelaysMs.length,
        delayMs,
        permission:
          typeof window !== "undefined" && "Notification" in window
            ? Notification.permission
            : "unsupported",
      });

      const ok = await (async () => {
        setIsRegistering(true);
        pushDebug("registerToken start");

        try {
          const { token, deviceId } = await getPushToken();
          pushDebug("registerToken generated", {
            hasToken: Boolean(token),
            token: token ? tokenPreview(token) : null,
            deviceId,
          });

          if (!token) {
            lastRegisterFailureRef.current =
              "Não foi possível registrar o dispositivo para notificações agora.";
            pushDebug("registerToken aborted: no token", { attempt });
            return false;
          }

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

          pushDebug("registerToken api response", {
            status: response.status,
            ok: response.ok,
            responseBody,
          });

          if (!response.ok) {
            lastRegisterFailureRef.current =
              "Não foi possível vincular este dispositivo à sua conta.";
            return false;
          }

          return true;
        } catch (error) {
          pushDebug("registerToken error", {
            error: error instanceof Error ? error.message : String(error),
            attempt,
          });
          lastRegisterFailureRef.current =
            error instanceof Error
              ? error.message
              : "Falha ao registrar notificações";
          return false;
        } finally {
          setIsRegistering(false);
          pushDebug("registerToken end", { attempt });
        }
      })();

      if (ok) {
        pushDebug("registerToken success", { attempt });
        return true;
      }
    }

    pushDebug("registerToken exhausted retries");
    return false;
    })();

    registerInFlightRef.current = run;

    try {
      return await run;
    } finally {
      registerInFlightRef.current = null;
    }
  }, []);

  const registerToken = useCallback(async (): Promise<boolean> => {
    return registerTokenWithRetry();
  }, [registerTokenWithRetry]);

  const syncRegisteredToken = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      pushDebug("syncRegisteredToken skipped: notification api unavailable");
      return;
    }

    if (Notification.permission !== "granted") {
      pushDebug("syncRegisteredToken skipped: permission not granted", {
        permission: Notification.permission,
      });
      return;
    }

    const storedToken = getStoredPushToken();
    pushDebug("syncRegisteredToken start", {
      hasStoredToken: Boolean(storedToken),
      storedToken: storedToken ? tokenPreview(storedToken) : null,
    });

    if (!storedToken) {
      // Force token generation after login when local storage was cleared.
      await registerToken();
      return;
    }

    await registerToken();
  }, [registerToken]);

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    pushDebug("enableNotifications start", {
      isSupportedState,
      permission:
        typeof window !== "undefined" && "Notification" in window
          ? Notification.permission
          : "unsupported",
    });

    if (!isSupportedState) {
      pushDebug("enableNotifications aborted: unsupported device");
      toast.error(
        "Este navegador não oferece suporte a notificações push para o Central Connect.",
      );
      return false;
    }

    const permissionStatus = await requestNotificationPermission();
    setPermission(permissionStatus);

    if (permissionStatus !== "granted") {
      pushDebug("enableNotifications aborted: permission not granted", {
        permissionStatus,
      });
      toast.error(
        "Você negou a permissão de notificações. Ative nas configurações do navegador para receber avisos de escala.",
      );
      return false;
    }

    const ok = await registerToken();

    if (ok) {
      pushDebug("enableNotifications success");
      toast.success(
        "Pronto! Este dispositivo agora receberá notificações de escalas e atualizações.",
      );
      return true;
    }

    pushDebug("enableNotifications failed while registering token");
    const failureMessage = lastRegisterFailureRef.current ?? "";

    if (
      failureMessage.includes("push service error") ||
      failureMessage.includes("Registration failed")
    ) {
      toast.error(
        "Não conseguimos ativar notificações neste navegador. Se estiver no Brave, desative Shields para este site e tente novamente.",
      );
      return false;
    }

    toast.error(
      "Não foi possível ativar notificações agora. Tente novamente em alguns segundos.",
    );
    return false;
  }, [isSupportedState, registerToken]);

  const autoEnableNotificationsAfterLogin = useCallback(async (): Promise<boolean> => {
    pushDebug("autoEnableNotificationsAfterLogin start", {
      isSupportedState,
      hasNotificationApi:
        typeof window !== "undefined" && "Notification" in window,
      permission:
        typeof window !== "undefined" && "Notification" in window
          ? Notification.permission
          : "unsupported",
    });

    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !isSupportedState
    ) {
      pushDebug("autoEnableNotificationsAfterLogin skipped: preconditions not met");
      return false;
    }

    if (Notification.permission === "granted") {
      setPermission("granted");
      pushDebug("autoEnableNotificationsAfterLogin: permission already granted");
      await syncRegisteredToken();
      return true;
    }

    if (Notification.permission === "denied") {
      setPermission("denied");
      pushDebug("autoEnableNotificationsAfterLogin: permission denied");
      return false;
    }

    const rawLastPrompt = window.localStorage.getItem(AUTO_PROMPT_TS_KEY);
    const lastPrompt = rawLastPrompt ? Number(rawLastPrompt) : 0;

    if (Number.isFinite(lastPrompt) && Date.now() - lastPrompt < AUTO_PROMPT_COOLDOWN_MS) {
      pushDebug("autoEnableNotificationsAfterLogin skipped: cooldown active", {
        lastPrompt,
        elapsedMs: Date.now() - lastPrompt,
        cooldownMs: AUTO_PROMPT_COOLDOWN_MS,
      });
      return false;
    }

    pushDebug("autoEnableNotificationsAfterLogin prompting notification permission");
    window.localStorage.setItem(AUTO_PROMPT_TS_KEY, String(Date.now()));
    return enableNotifications();
  }, [enableNotifications, isSupportedState, syncRegisteredToken]);

  useEffect(() => {
    let mounted = true;

    const setupSupport = async () => {
      const supported = await isPushSupported();

      if (!mounted) {
        return;
      }

      setIsSupportedState(supported);
      pushDebug("setupSupport resolved", { supported });

      if (typeof window !== "undefined" && "Notification" in window) {
        setPermission(Notification.permission);
        pushDebug("setupSupport permission snapshot", {
          permission: Notification.permission,
        });
      }
    };

    setupSupport();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!enableForegroundListener) {
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const bindForegroundNotifications = async () => {
      unsubscribe = await onForegroundPush((payload) => {
        const title = payload.notification?.title ?? "Central Connect • Nova atualização";
        const body =
          payload.notification?.body ??
          "Há uma atualização importante na sua escala. Abra para ver os detalhes.";

        toast.info(`${title}: ${body}`);
      });
    };

    bindForegroundNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [enableForegroundListener]);

  return useMemo(
    () => ({
      isSupported: isSupportedState,
      permission,
      isRegistering,
      enableNotifications,
      autoEnableNotificationsAfterLogin,
      syncRegisteredToken,
    }),
    [
      autoEnableNotificationsAfterLogin,
      enableNotifications,
      isRegistering,
      isSupportedState,
      permission,
      syncRegisteredToken,
    ],
  );
}
