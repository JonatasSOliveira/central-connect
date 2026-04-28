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
  syncRegisteredToken: () => Promise<void>;
}

interface UsePushNotificationsOptions {
  enableForegroundListener?: boolean;
}

export function usePushNotifications(
  options?: UsePushNotificationsOptions,
): UsePushNotificationsResult {
  const enableForegroundListener = options?.enableForegroundListener ?? true;
  const [isSupportedState, setIsSupportedState] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRegistering, setIsRegistering] = useState(false);

  const registerToken = useCallback(async (): Promise<boolean> => {
    setIsRegistering(true);

    try {
      const { token, deviceId } = await getPushToken();

      if (!token) {
        return false;
      }

      const response = await fetch("/api/push-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, deviceId, platform: "web" }),
      });

      if (!response.ok) {
        return false;
      }

      return true;
    } catch {
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  const syncRegisteredToken = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const storedToken = getStoredPushToken();

    if (Notification.permission !== "granted" || !storedToken) {
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
      syncRegisteredToken,
    }),
    [
      enableNotifications,
      isRegistering,
      isSupportedState,
      permission,
      syncRegisteredToken,
    ],
  );
}
