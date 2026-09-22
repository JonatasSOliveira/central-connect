"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ScaleAttendanceListSection } from "@/features/scale-attendance/components/ScaleAttendanceListSection";
import { Permission } from "@/shared/domain/enums/Permission";

export default function ScaleAttendancesPage() {
  const { user } = useAuth();

  usePermissions({
    requiredPermissions: [Permission.SCALE_ATTENDANCE_READ],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Chamadas"
        subtitle="Gerencie as chamadas por período"
        backHref="/home"
      />
      <div className="px-4 pt-3 pb-4 md:px-6 md:pt-4">
        <div className="mx-auto max-w-3xl">
          <ScaleAttendanceListSection churchId={user?.churchId ?? null} />
        </div>
      </div>
    </>
  );
}
