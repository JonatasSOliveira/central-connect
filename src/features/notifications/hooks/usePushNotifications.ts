"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const PUSH_DEBUG_ENABLED =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_PUSH_DEBUG === "true";

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

  const registerToken = useCallback(async (): Promise<boolean> => {
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
        pushDebug("registerToken aborted: no token");
        return false;
      }

      const response = await fetch("/api/push-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, deviceId, platform: "web" }),
      });

      pushDebug("registerToken api response", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        return false;
      }

      return true;
    } catch (error) {
      pushDebug("registerToken error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    } finally {
      setIsRegistering(false);
      pushDebug("registerToken end");
    }
  }, []);

  const syncRegisteredToken = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
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
    if (!isSupportedState) {
      toast.error("Notificações não suportadas neste dispositivo");
      return false;
    }

    const permissionStatus = await requestNotificationPermission();
    setPermission(permissionStatus);

    if (permissionStatus !== "granted") {
      toast.error("Permissão de notificações não concedida");
      return false;
    }

    const ok = await registerToken();

    if (ok) {
      toast.success("Notificações ativadas com sucesso");
      return true;
    }

    toast.error("Não foi possível ativar notificações");
    return false;
  }, [isSupportedState, registerToken]);

  const autoEnableNotificationsAfterLogin = useCallback(async (): Promise<boolean> => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !isSupportedState
    ) {
      return false;
    }

    if (Notification.permission === "granted") {
      setPermission("granted");
      await syncRegisteredToken();
      return true;
    }

    if (Notification.permission === "denied") {
      setPermission("denied");
      return false;
    }

    const rawLastPrompt = window.localStorage.getItem(AUTO_PROMPT_TS_KEY);
    const lastPrompt = rawLastPrompt ? Number(rawLastPrompt) : 0;

    if (Number.isFinite(lastPrompt) && Date.now() - lastPrompt < AUTO_PROMPT_COOLDOWN_MS) {
      return false;
    }

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

      if (typeof window !== "undefined" && "Notification" in window) {
        setPermission(Notification.permission);
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
        const title = payload.notification?.title ?? "Nova notificação";
        const body = payload.notification?.body;

        if (body) {
          toast.info(`${title}: ${body}`);
          return;
        }

        toast.info(title);
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
