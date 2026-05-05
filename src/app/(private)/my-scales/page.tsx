"use client";

import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { MyScalesList } from "@/features/my-scales/components/MyScalesList";

export default function MyScalesPage() {
  usePermissions({
    requiredPermissions: [Permission.MY_SCALES_READ],
    redirectTo: "/home",
  });

  return <MyScalesList />;
}
