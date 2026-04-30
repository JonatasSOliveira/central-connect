"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  const pathname = usePathname();

  useEffect(() => {
    const enableDevServiceWorker =
      process.env.NEXT_PUBLIC_ENABLE_SW_IN_DEV === "true";
    const debugEnabled = process.env.NEXT_PUBLIC_PUSH_DEBUG === "true";

    const swDebug = (message: string, payload?: unknown) => {
      if (!debugEnabled) {
        return;
      }

      if (payload !== undefined) {
        console.log(`[push-debug][sw] ${message}`, payload);
        return;
      }

      console.log(`[push-debug][sw] ${message}`);
    };

    if (process.env.NODE_ENV !== "production" && !enableDevServiceWorker) {
      if ("serviceWorker" in navigator) {
        swDebug("dev mode without sw enabled, unregistering", { pathname });
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            return Promise.all(
              registrations.map((registration) => registration.unregister()),
            );
          })
          .then(() => {
            swDebug("service workers unregistered in dev", { pathname });
          })
          .catch(() => {
            swDebug("failed to unregister service workers in dev");
          });
      }

      return;
    }

    if ("serviceWorker" in navigator) {
      swDebug("registering service worker", { pathname });
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          swDebug("service worker registered", {
            pathname,
            scope: registration.scope,
          });
        })
        .catch((error) => {
          swDebug("service worker registration failed", {
            pathname,
            error: error instanceof Error ? error.message : String(error),
          });
        });
    }
  }, [pathname]);

  return null;
}
