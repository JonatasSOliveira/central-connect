"use client";

import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ScaleList } from "@/features/scales/components/ScaleList";
import { Permission } from "@/shared/domain/enums/Permission";

export default function ScalesPage() {
  usePermissions({
    requiredPermissions: [Permission.SCALE_READ],
    redirectTo: "/home",
  });

  return <ScaleList />;
}
