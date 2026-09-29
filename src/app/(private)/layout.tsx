"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/templates/app-shell";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePushNotifications } from "@/features/notifications/hooks/usePushNotifications";

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
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const isHome = pathname === "/home";
  const isChurchManagement =
    pathname === "/churches" || pathname.startsWith("/churches/");
  const { permission, syncRegisteredToken, autoEnableNotificationsAfterLogin } =
    usePushNotifications({ enableForegroundListener: !isHome });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isHome || !isAuthenticated || permission !== "granted") {
      pushDebug("syncRegisteredToken skipped", {
        isHome,
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
  }, [isHome, isAuthenticated, permission, syncRegisteredToken]);

  useEffect(() => {
    if (isHome || !isAuthenticated) {
      pushDebug("autoEnableNotificationsAfterLogin skipped", {
        isHome,
        isAuthenticated,
      });
      return;
    }

    pushDebug("autoEnableNotificationsAfterLogin triggered");
    autoEnableNotificationsAfterLogin();
  }, [autoEnableNotificationsAfterLogin, isHome, isAuthenticated]);

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
    <AppShell showNavigation={!isHome && !isChurchManagement}>
      {children}
    </AppShell>
  );
}
