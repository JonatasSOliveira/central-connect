"use client";

import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHomeScaleAttendances } from "../hooks/useHomeScaleAttendances";
import type { AttendanceTimelineFilter } from "../types";

interface ScaleAttendanceListSectionProps {
  churchId: string | null;
}

const FILTER_OPTIONS: Array<{
  key: AttendanceTimelineFilter;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { key: "today", label: "Hoje", icon: CalendarDays },
  { key: "upcoming", label: "Próximas", icon: CalendarClock },
  { key: "overdue", label: "Atrasadas", icon: AlertCircle },
];

export function ScaleAttendanceListSection({
  churchId,
}: ScaleAttendanceListSectionProps) {
  const router = useRouter();
  const { filter, setFilter, items, title, isLoading, error, refresh } =
    useHomeScaleAttendances(churchId);

  const totalMembers = items.reduce((sum, item) => sum + item.memberCount, 0);
  const totalChecked = items.reduce((sum, item) => sum + item.checkedCount, 0);
  const completionRate =
    totalMembers === 0 ? 0 : Math.round((totalChecked / totalMembers) * 100);
  const hasItems = items.length > 0;

  return (
    <section className="mb-6">
      <div className="mb-3 rounded-xl border border-primary/20 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {items.length} escala{items.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {hasItems
                ? "Toque em uma escala para abrir a chamada"
                : "Nenhuma escala disponível neste período"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            className="h-9"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="space-y-2">
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {totalChecked}/{totalMembers} presenças registradas (
            {completionRate}%)
          </p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-1">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={cn(
              "flex h-11 items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors",
              filter === option.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/60",
            )}
          >
            <option.icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-destructive/20 bg-card p-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            className="mt-2"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-2" />
            Tentar novamente
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-center">
          <div className="animate-spin h-5 w-5 rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            Nenhuma chamada encontrada
          </p>
          <p className="text-xs text-muted-foreground">
            Tente alternar entre Hoje, Próximas e Atrasadas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => {
            const serviceDate = new Date(item.serviceDate);
            const formattedDate = serviceDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            const statusLabel =
              item.attendanceStatus === "published" ? "Publicada" : "Rascunho";
            const StatusIcon =
              item.attendanceStatus === "published" ? Clock3 : ClipboardCheck;
            const completion =
              item.memberCount === 0
                ? 0
                : Math.round((item.checkedCount / item.memberCount) * 100);

            return (
              <button
                key={item.scaleId}
                type="button"
                onClick={() =>
                  router.push(`/scales/${item.scaleId}/attendance`)
                }
                className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[15px] text-foreground">
                      {item.ministryName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.serviceTitle}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
                    <StatusIcon className="h-3 w-3" />
                    {statusLabel}
                  </span>
                </div>

                <p className="mb-2 text-xs text-muted-foreground">
                  {formattedDate} às {item.serviceTime}
                </p>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Chamada</span>
                    <span className="font-medium text-foreground">
                      {item.checkedCount}/{item.memberCount}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
