"use client";

import { BarChart3, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MinistrySelect } from "@/components/ui/ministry-select";
import { useScaleAttendanceReport } from "../hooks/useScaleAttendanceReport";
import { ScaleAttendanceReportList } from "./ScaleAttendanceReportList";

interface ScaleAttendanceReportSectionProps {
  churchId: string | null;
}

export function ScaleAttendanceReportSection({
  churchId,
}: ScaleAttendanceReportSectionProps) {
  const {
    filters,
    summary,
    items,
    ministries,
    isLoading,
    error,
    applyFilters,
    refresh,
  } = useScaleAttendanceReport(churchId);

  const [localStartDate, setLocalStartDate] = useState(filters.startDate);
  const [localEndDate, setLocalEndDate] = useState(filters.endDate);
  const [localMinistryId, setLocalMinistryId] = useState(
    filters.ministryId ?? "",
  );

  const canApplyFilters = Boolean(localStartDate && localEndDate);
  const selectedMinistryLabel = useMemo(() => {
    if (!filters.ministryId) return "Todos os ministérios";
    const selected = ministries.find(
      (ministry) => ministry.id === filters.ministryId,
    );
    return selected?.name ?? "Ministério selecionado";
  }, [filters.ministryId, ministries]);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Filtros
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Data inicial
            </label>
            <input
              type="date"
              value={localStartDate}
              onChange={(event) => setLocalStartDate(event.target.value)}
              className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Data final</label>
            <input
              type="date"
              value={localEndDate}
              onChange={(event) => setLocalEndDate(event.target.value)}
              className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-1">
            <MinistrySelect
              label="Ministério"
              value={localMinistryId}
              onChange={setLocalMinistryId}
              ministries={ministries}
              allOptionLabel="Todos os ministérios"
              placeholder="Todos os ministérios"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() =>
              applyFilters({
                startDate: localStartDate,
                endDate: localEndDate,
                ministryId: localMinistryId || undefined,
              })
            }
            disabled={!canApplyFilters}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Gerar relatório
          </Button>
          <span className="text-xs text-muted-foreground">
            {selectedMinistryLabel}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Relatório de escalas
            </p>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {summary.scaleCount} escala{summary.scaleCount !== 1 ? "s" : ""}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Total de pessoas escaladas: {summary.memberCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Presentes: {summary.presentCount}/{summary.memberCount} (
              {summary.completionRate}%)
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={refresh}>
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-6">
          <div className="rounded-lg bg-muted/40 p-2">
            Publicadas: {summary.publishedCount}
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            Rascunho: {summary.draftCount}
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            Presentes: {summary.presentCount}
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            Pendentes: {summary.pendingCount}
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            Falta sem justificativa: {summary.absentUnexcusedCount}
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            Falta justificada: {summary.absentExcusedCount}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-card p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-card p-5">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">
            Nenhuma chamada no período
          </p>
          <p className="text-xs">
            Escolha um período diferente para gerar o relatório.
          </p>
        </div>
      ) : (
        <ScaleAttendanceReportList items={items} />
      )}
    </section>
  );
}
