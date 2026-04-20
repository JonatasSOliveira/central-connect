"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
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
