"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Permission } from "@/domain/enums/Permission";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { MyScalesList } from "@/features/my-scales/components/MyScalesList";

export default function MyScalesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const canReadMyScales =
    user?.isSuperAdmin || user?.permissions.includes(Permission.MY_SCALES_READ);
  const canReadOwnScales =
    user?.isSuperAdmin || user?.permissions.includes(Permission.SCALE_SELF_READ);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    if (!canReadMyScales && !canReadOwnScales) {
      router.push("/home");
    }
  }, [canReadMyScales, canReadOwnScales, isLoading, router, user]);

  if (isLoading || (!canReadMyScales && !canReadOwnScales)) {
    return null;
  }

  return <MyScalesList />;
}
