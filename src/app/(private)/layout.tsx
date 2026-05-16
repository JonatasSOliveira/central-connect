"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePushNotifications } from "@/features/notifications/hooks/usePushNotifications";
import { Loader2 } from "lucide-react";

const PUSH_DEBUG_ENABLED = process.env.NEXT_PUBLIC_PUSH_DEBUG === "true";

function pushDebug(message: string, payload?: unknown): void {
  if (!PUSH_DEBUG_ENABLED) {
    return;
  }

  if (payload !== undefined) {
    console.log(`[push-debug][private-layout] ${message}`, payload);
    return;
  }

  console.log(`[push-debug][private-layout] ${message}`);
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { permission, syncRegisteredToken, autoEnableNotificationsAfterLogin } =
    usePushNotifications();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || permission !== "granted") {
      pushDebug("syncRegisteredToken skipped", {
        isAuthenticated,
        permission,
      });
      return;
    }

    pushDebug("syncRegisteredToken scheduled", {
      permission,
      delayMs: 300,
    });

    const timeoutId = window.setTimeout(() => {
      pushDebug("syncRegisteredToken executing", { permission });
      syncRegisteredToken();
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, permission, syncRegisteredToken]);

  useEffect(() => {
    if (!isAuthenticated) {
      pushDebug("autoEnableNotificationsAfterLogin skipped", {
        isAuthenticated,
      });
      return;
    }

    pushDebug("autoEnableNotificationsAfterLogin triggered");
    autoEnableNotificationsAfterLogin();
  }, [autoEnableNotificationsAfterLogin, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pt-16 pb-14">{children}</div>
    </div>
  );
}
