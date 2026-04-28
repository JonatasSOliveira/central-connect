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

  const registration = await navigator.serviceWorker.ready;
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  if (!vapidKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_VAPID_KEY não configurada");
  }

  const messaging = getMessaging(getFirebaseClientApp());
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

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
