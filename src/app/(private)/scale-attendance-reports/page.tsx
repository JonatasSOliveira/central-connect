"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ScaleAttendanceReportSection } from "@/features/scale-attendance/components/ScaleAttendanceReportSection";

export default function ScaleAttendanceReportsPage() {
  const { user } = useAuth();

  usePermissions({
    requiredPermissions: [Permission.SCALE_ATTENDANCE_REPORT_READ],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Relatório de Escalas"
        subtitle="Acompanhe indicadores por período e ministério"
        backHref="/home"
      />
      <div className="px-4 pb-4 pt-3 md:px-6 md:pt-4">
        <div className="mx-auto max-w-3xl">
          <ScaleAttendanceReportSection churchId={user?.churchId ?? null} />
        </div>
      </div>
    </>
  );
}
