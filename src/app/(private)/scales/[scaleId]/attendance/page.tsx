"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ScaleAttendanceScreen } from "@/features/scale-attendance/components/ScaleAttendanceScreen";

interface ScaleAttendancePageProps {
  params: Promise<{ scaleId: string }>;
}

export default function ScaleAttendancePage({
  params,
}: ScaleAttendancePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const { scaleId } = use(params);
  const isReadOnlyMode = searchParams.get("mode") === "readonly";
  const cameFromReport = searchParams.get("from") === "report";

  const canReadAttendance =
    user?.isSuperAdmin ||
    user?.permissions.includes(Permission.SCALE_ATTENDANCE_READ) ||
    user?.permissions.includes(Permission.SCALE_ATTENDANCE_REPORT_READ) ||
    user?.permissions.includes(Permission.SCALE_READ);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    if (!canReadAttendance) {
      router.push("/home");
    }
  }, [canReadAttendance, isLoading, router, user]);

  if (isLoading || !canReadAttendance) {
    return null;
  }

  return (
    <>
      <PrivateHeader
        title="Chamada da Escala"
        subtitle={
          isReadOnlyMode
            ? "Visualização somente leitura"
            : "Marque presença e faltas"
        }
        backHref={
          cameFromReport ? "/scale-attendance-reports" : "/scale-attendances"
        }
      />
      <div className="px-4 pt-3 pb-4 md:pt-4">
        <ScaleAttendanceScreen scaleId={scaleId} readOnly={isReadOnlyMode} />
      </div>
    </>
  );
}
