import type {
  AttendanceTimelineFilter,
  ScaleAttendanceDetail,
  ScaleAttendanceHomeItem,
  ScaleAttendanceReportItem,
  ScaleAttendanceReportMinistryOption,
  ScaleAttendanceReportSummary,
} from "../types";

interface ApiErrorPayload {
  error?: { message?: string };
}

function getErrorMessage(payload: unknown, fallback: string): string {
  const typed = payload as ApiErrorPayload;
  return typed.error?.message ?? fallback;
}

export async function getScaleAttendancesForHome(
  churchId: string,
  filter: AttendanceTimelineFilter,
): Promise<ScaleAttendanceHomeItem[]> {
  const response = await fetch(
    `/api/scale-attendances?churchId=${churchId}&filter=${filter}`,
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(getErrorMessage(data, "Falha ao carregar chamadas"));
  }

  return data.value.items.map(
    (
      item: Omit<ScaleAttendanceHomeItem, "serviceDate"> & {
        serviceDate: string;
      },
    ) => ({
      ...item,
      serviceDate: item.serviceDate,
    }),
  );
}

export async function getScaleAttendance(
  scaleId: string,
): Promise<ScaleAttendanceDetail> {
  const response = await fetch(`/api/scales/${scaleId}/attendance`);
  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(getErrorMessage(data, "Falha ao carregar chamada"));
  }

  return data.value.attendance;
}

export async function saveScaleAttendance(
  scaleId: string,
  entries: Array<{
    scaleMemberId: string;
    status: "present" | "absent_unexcused" | "absent_excused";
    justification?: string;
  }>,
): Promise<ScaleAttendanceDetail> {
  const response = await fetch(`/api/scales/${scaleId}/attendance`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(getErrorMessage(data, "Falha ao salvar chamada"));
  }

  return data.value.attendance;
}

export async function publishScaleAttendance(
  scaleId: string,
): Promise<ScaleAttendanceDetail> {
  const response = await fetch(`/api/scales/${scaleId}/attendance/publish`, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(getErrorMessage(data, "Falha ao publicar chamada"));
  }

  return data.value.attendance;
}

export interface GetScaleAttendanceReportInput {
  churchId: string;
  startDate: string;
  endDate: string;
  ministryId?: string;
}

export interface GetScaleAttendanceReportOutput {
  summary: ScaleAttendanceReportSummary;
  items: ScaleAttendanceReportItem[];
  ministries: ScaleAttendanceReportMinistryOption[];
}

export async function getScaleAttendanceReport(
  input: GetScaleAttendanceReportInput,
): Promise<GetScaleAttendanceReportOutput> {
  const params = new URLSearchParams({
    churchId: input.churchId,
    startDate: input.startDate,
    endDate: input.endDate,
  });

  if (input.ministryId) {
    params.append("ministryId", input.ministryId);
  }

  const response = await fetch(`/api/scale-attendance-reports?${params}`);
  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(
      getErrorMessage(data, "Falha ao carregar relatório de escalas"),
    );
  }

  return {
    summary: data.value.summary,
    items: data.value.items.map(
      (
        item: Omit<ScaleAttendanceReportItem, "serviceDate"> & {
          serviceDate: string;
        },
      ) => ({
        ...item,
        serviceDate: item.serviceDate,
      }),
    ),
    ministries: data.value.ministries,
  };
}
