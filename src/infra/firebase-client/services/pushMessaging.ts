import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Unsubscribe,
} from "firebase/messaging";
import { getFirebaseClientApp } from "@/infra/firebase-client/firebaseConfig";

const PUSH_TOKEN_STORAGE_KEY = "cc:push-token";
const DEVICE_ID_STORAGE_KEY = "cc:push-device-id";
const SERVICE_WORKER_READY_TIMEOUT_MS = 4000;
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
    console.log(`[push-debug][messaging] ${message}`, payload);
    return;
  }

  console.log(`[push-debug][messaging] ${message}`);
}

function previewValue(value: string | undefined | null): string | null {
  if (!value) {
    return null;
  }

  if (value.length <= 10) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function normalizeVapidKey(rawValue: string | undefined): string | null {
  if (!rawValue) {
    return null;
  }

  const trimmed = rawValue.trim();
  const withoutQuotes = trimmed.replace(/^['"]|['"]$/g, "");

  return withoutQuotes.length > 0 ? withoutQuotes : null;
}

async function waitForServiceWorkerReady(timeoutMs: number): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker não suportado");
  }

  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error("Timeout aguardando Service Worker ready"));
      }, timeoutMs);
    }),
  ]);
}

async function ensureMessagingServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration("/");

  if (existing) {
    pushDebug("using existing service worker registration", {
      scope: existing.scope,
    });
    return existing;
  }

  const registered = await navigator.serviceWorker.register("/sw.js");
  pushDebug("registered service worker for messaging", {
    scope: registered.scope,
  });
  return registered;
}

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  const stored = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (stored) {
    return stored;
  }

  const generated = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, generated);
  return generated;
}

export function getStoredPushToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
}

export function clearStoredPushToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
}

export async function isPushSupported(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  return isSupported();
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined") {
    return "default";
  }

  if (!("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  return Notification.requestPermission();
}

export async function getPushToken(): Promise<{
  token: string | null;
  deviceId: string;
}> {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "server";
  pushDebug("getPushToken start", { pathname });

  const supported = await isPushSupported();
  if (!supported || typeof window === "undefined") {
    pushDebug("getPushToken skipped: unsupported runtime", {
      reason: "unsupported_runtime",
      supported,
      isWindowDefined: typeof window !== "undefined",
      pathname,
    });
    return { token: null, deviceId: "unsupported" };
  }

  const deviceId = getOrCreateDeviceId();
  pushDebug("getPushToken deviceId", { deviceId, pathname });

  if (Notification.permission !== "granted") {
    pushDebug("getPushToken skipped: permission not granted", {
      reason: "permission_not_granted",
      permission: Notification.permission,
      deviceId,
      pathname,
    });
    return { token: null, deviceId };
  }

  let registration: ServiceWorkerRegistration;

  try {
    registration = await waitForServiceWorkerReady(
      SERVICE_WORKER_READY_TIMEOUT_MS,
    );
    pushDebug("getPushToken service worker ready", {
      scope: registration.scope,
      pathname,
    });
  } catch (error) {
    pushDebug("service worker ready timeout, trying explicit registration", {
      reason: "service_worker_ready_timeout",
      deviceId,
      pathname,
      error: error instanceof Error ? error.message : String(error),
    });

    try {
      registration = await ensureMessagingServiceWorkerRegistration();
    } catch (registrationError) {
      pushDebug("getPushToken skipped: unable to ensure service worker", {
        reason: "service_worker_registration_failed",
        deviceId,
        pathname,
        error:
          registrationError instanceof Error
            ? registrationError.message
            : String(registrationError),
      });
      return { token: null, deviceId };
    }
  }

  const vapidKey = normalizeVapidKey(
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  );

  pushDebug("getPushToken firebase context", {
    pathname,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? null,
    vapidKeyPreview: previewValue(vapidKey),
  });

  if (!vapidKey) {
    pushDebug("getPushToken error: missing vapid key", {
      reason: "missing_vapid_key",
      deviceId,
      pathname,
    });
    throw new Error("NEXT_PUBLIC_FIREBASE_VAPID_KEY não configurada");
  }

  const messaging = getMessaging(getFirebaseClientApp());
  let token: string;

  try {
    token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Falha ao gerar token push";
    const firebaseError = error as {
      code?: string | number;
      name?: string;
      stack?: string;
      customData?: unknown;
    };

    pushDebug("getPushToken firebase getToken error", {
      reason: "firebase_get_token_error",
      deviceId,
      pathname,
      error: errorMessage,
      errorCode: firebaseError?.code ?? null,
      errorName: firebaseError?.name ?? null,
      errorCustomData: firebaseError?.customData ?? null,
      errorKeys:
        typeof error === "object" && error !== null
          ? Object.keys(error as Record<string, unknown>)
          : [],
    });

    const shouldRetryAfterCleanup =
      errorMessage.includes("Registration failed - push service error") ||
      String(firebaseError?.code ?? "") === "20";

    if (shouldRetryAfterCleanup) {
      pushDebug("attempting token recovery by clearing subscription", {
        pathname,
        deviceId,
      });

      const cleared = await clearExistingPushSubscription(registration);

      if (cleared) {
        try {
          token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
          });

          pushDebug("token recovery succeeded after subscription cleanup", {
            pathname,
            deviceId,
            token: tokenPreview(token),
          });
        } catch (retryError) {
          pushDebug("token recovery failed after subscription cleanup", {
            pathname,
            deviceId,
            error:
              retryError instanceof Error
                ? retryError.message
                : String(retryError),
          });
          throw retryError;
        }
      }
    }

    if (errorMessage.includes("atob")) {
      throw new Error(
        "NEXT_PUBLIC_FIREBASE_VAPID_KEY inválida. Use a Public key do Firebase Cloud Messaging (Web Push).",
      );
    }

    throw error;
  }

  if (token) {
    window.localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    pushDebug("getPushToken success", {
      reason: "token_generated",
      deviceId,
      pathname,
      token: tokenPreview(token),
    });
  } else {
    pushDebug("getPushToken empty token", {
      reason: "empty_token",
      deviceId,
      pathname,
    });
  }

  return { token: token || null, deviceId };
}

async function clearExistingPushSubscription(
  registration: ServiceWorkerRegistration,
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return false;
    }

    const endpointPreview = previewValue(subscription.endpoint);
    const unsubscribed = await subscription.unsubscribe();
    pushDebug("cleared existing push subscription", {
      endpointPreview,
      unsubscribed,
    });

    return unsubscribed;
  } catch (error) {
    pushDebug("failed to clear existing push subscription", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function onForegroundPush(
  listener: (payload: MessagePayload) => void,
): Promise<Unsubscribe | null> {
  const supported = await isPushSupported();
  if (!supported) {
    return null;
  }

  const messaging = getMessaging(getFirebaseClientApp());
  return onMessage(messaging, listener);
}
