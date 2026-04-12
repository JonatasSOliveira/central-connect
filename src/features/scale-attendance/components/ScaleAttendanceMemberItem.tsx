"use client";

import { cn } from "@/lib/utils";
import type { ScaleAttendanceEntry } from "../types";

interface ScaleAttendanceMemberItemProps {
  entry: ScaleAttendanceEntry & { justificationDraft: string };
  canEdit: boolean;
  showJustificationError?: boolean;
  onMarkStatus: (
    scaleMemberId: string,
    status: "present" | "absent_unexcused" | "absent_excused",
  ) => void;
  onUpdateJustification: (scaleMemberId: string, value: string) => void;
}

export function ScaleAttendanceMemberItem({
  entry,
  canEdit,
  showJustificationError = false,
  onMarkStatus,
  onUpdateJustification,
}: ScaleAttendanceMemberItemProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <p className="font-semibold text-foreground text-sm">
          {entry.memberName}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Selecione o status deste membro
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          disabled={!canEdit}
          onClick={() => onMarkStatus(entry.scaleMemberId, "present")}
          className={cn(
            "min-h-11 rounded-lg border px-2 py-2 text-xs leading-tight font-medium text-left sm:text-center",
            entry.status === "present"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:bg-muted/60",
          )}
        >
          Presente
        </button>
        <button
          type="button"
          disabled={!canEdit}
          onClick={() => onMarkStatus(entry.scaleMemberId, "absent_unexcused")}
          className={cn(
            "min-h-11 rounded-lg border px-2 py-2 text-xs leading-tight font-medium text-left sm:text-center",
            entry.status === "absent_unexcused"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:bg-muted/60",
          )}
        >
          Falta sem justificativa
        </button>
        <button
          type="button"
          disabled={!canEdit}
          onClick={() => onMarkStatus(entry.scaleMemberId, "absent_excused")}
          className={cn(
            "min-h-11 rounded-lg border px-2 py-2 text-xs leading-tight font-medium text-left sm:text-center",
            entry.status === "absent_excused"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:bg-muted/60",
          )}
        >
          Falta justificada
        </button>
      </div>

      {entry.status === "absent_excused" && (
        <textarea
          value={entry.justificationDraft}
          disabled={!canEdit}
          onChange={(event) =>
            onUpdateJustification(entry.scaleMemberId, event.target.value)
          }
          rows={2}
          className={cn(
            "w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2",
            showJustificationError
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
              : "border-input focus-visible:border-ring focus-visible:ring-ring/50",
          )}
          placeholder="Descreva o motivo da ausência"
        />
      )}
      {entry.status === "absent_excused" && showJustificationError && (
        <p className="text-xs text-destructive">Justificativa obrigatória.</p>
      )}
    </div>
  );
}
