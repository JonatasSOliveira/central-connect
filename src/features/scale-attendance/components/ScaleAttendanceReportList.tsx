"use client";

import { CalendarCheck2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ScaleAttendanceReportItem } from "../types";

interface ScaleAttendanceReportListProps {
  items: ScaleAttendanceReportItem[];
}

export function ScaleAttendanceReportList({
  items,
}: ScaleAttendanceReportListProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((item) => {
        const serviceDate = new Date(item.serviceDate);
        const formattedDate = serviceDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        return (
          <button
            key={item.scaleId}
            type="button"
            onClick={() =>
              router.push(
                `/scales/${item.scaleId}/attendance?mode=readonly&from=report`,
              )
            }
            className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">
                  {item.ministryName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.serviceTitle}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground">
                <CalendarCheck2 className="h-3 w-3" />
                {item.attendanceStatus === "published"
                  ? "Publicada"
                  : "Rascunho"}
              </span>
            </div>

            <p className="mb-2 text-xs text-muted-foreground">
              {formattedDate} às {item.serviceTime}
            </p>
            <p className="text-xs text-muted-foreground">
              Presença: {item.checkedCount}/{item.memberCount} • Pendentes:{" "}
              {item.pendingCount}
            </p>
          </button>
        );
      })}
    </div>
  );
}
