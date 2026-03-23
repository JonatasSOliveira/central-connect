import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import type { Permission } from "@/domain/enums/Permission";
import { useAuth } from "./useAuth";

interface UsePermissionsOptions {
  requiredPermissions: Permission[];
  redirectTo?: string;
}

interface UsePermissionsReturn {
  hasPermission: boolean;
  isLoading: boolean;
}

function getCaller(): string {
  const error = new Error();
  const stack = error.stack?.split("\n") ?? [];
  return stack[3]?.trim() ?? "unknown";
}

export function usePermissions({
  requiredPermissions,
  redirectTo,
}: UsePermissionsOptions): UsePermissionsReturn {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const hasPermission =
    user?.isSuperAdmin ||
    requiredPermissions.every((p) => user?.permissions?.includes(p));

  useEffect(() => {
    if (isAuthLoading || !user) {
      return;
    }

    if (!hasPermission && redirectTo) {
      router.push(redirectTo);
    }
  }, [hasPermission, isAuthLoading, user, router, redirectTo]);

  return {
    hasPermission,
    isLoading: isAuthLoading,
  };
}
