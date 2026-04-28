"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    const enableDevServiceWorker =
      process.env.NEXT_PUBLIC_ENABLE_SW_IN_DEV === "true";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    const shouldDisableForAuthFlow = pathname.startsWith("/login");

    if (shouldDisableForAuthFlow && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          return Promise.all(
            registrations.map((registration) => registration.unregister()),
          );
        })
        .catch(() => {
          // noop
        });

      return;
    }

    if (process.env.NODE_ENV !== "production" && !enableDevServiceWorker) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            return Promise.all(
              registrations.map((registration) => registration.unregister()),
            );
          })
          .catch(() => {
            // noop
          });
      }

      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope,
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
