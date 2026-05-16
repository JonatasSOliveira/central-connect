"use client";

import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ScaleList } from "@/features/scales/components/ScaleList";

export default function ScalesPage() {
  usePermissions({
    requiredPermissions: [Permission.SCALE_READ],
    redirectTo: "/home",
  });

  return <ScaleList />;
}
