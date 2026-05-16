"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Permission } from "@/domain/enums/Permission";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { MyScalesScreen } from "@/features/my-scales/components/MyScalesScreen";

export default function MyScalesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const canReadScales =
    user?.isSuperAdmin || user?.permissions.includes(Permission.SCALE_READ);
  const canReadOwnScales =
    user?.isSuperAdmin ||
    user?.permissions.includes(Permission.SCALE_SELF_READ);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    if (!canReadScales && !canReadOwnScales) {
      router.push("/home");
    }
  }, [canReadOwnScales, canReadScales, isLoading, router, user]);

  if (isLoading || (!canReadScales && !canReadOwnScales)) {
    return null;
  }

  return <MyScalesScreen />;
}
