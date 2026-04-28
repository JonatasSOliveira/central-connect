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
  const supported = await isPushSupported();
  if (!supported || typeof window === "undefined") {
    return { token: null, deviceId: "unsupported" };
  }

  const deviceId = getOrCreateDeviceId();

  if (Notification.permission !== "granted") {
    return { token: null, deviceId };
  }

  let registration: ServiceWorkerRegistration;

  try {
    registration = await waitForServiceWorkerReady(
      SERVICE_WORKER_READY_TIMEOUT_MS,
    );
  } catch {
    return { token: null, deviceId };
  }

  const vapidKey = normalizeVapidKey(
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  );

  if (!vapidKey) {
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

    if (errorMessage.includes("atob")) {
      throw new Error(
        "NEXT_PUBLIC_FIREBASE_VAPID_KEY inválida. Use a Public key do Firebase Cloud Messaging (Web Push).",
      );
    }

    throw error;
  }

  if (token) {
    window.localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
  }

  return { token: token || null, deviceId };
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
