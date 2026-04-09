"use client";

import { use } from "react";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ScaleAttendanceScreen } from "@/features/scale-attendance/components/ScaleAttendanceScreen";

interface ScaleAttendancePageProps {
  params: Promise<{ scaleId: string }>;
}

export default function ScaleAttendancePage({
  params,
}: ScaleAttendancePageProps) {
  const { scaleId } = use(params);

  usePermissions({
    requiredPermissions: [Permission.SCALE_ATTENDANCE_READ],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Chamada da Escala"
        subtitle="Marque presença e faltas"
        backHref="/scale-attendances"
      />
      <div className="px-4 pt-3 pb-4 md:pt-4">
        <ScaleAttendanceScreen scaleId={scaleId} />
      </div>
    </>
  );
}
