import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

export function usePermissions({
  requiredPermissions,
  redirectTo = "/home",
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

    if (!hasPermission) {
      router.push(redirectTo);
    }
  }, [hasPermission, isAuthLoading, user, router, redirectTo]);

  return {
    hasPermission,
    isLoading: isAuthLoading,
  };
}
