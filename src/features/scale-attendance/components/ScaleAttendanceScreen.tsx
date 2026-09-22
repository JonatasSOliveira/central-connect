"use client";

import { CalendarX, CheckCircle2, Clock3, Save } from "lucide-react";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { useScaleAttendanceScreen } from "../hooks/useScaleAttendanceScreen";
import { ScaleAttendanceMemberItem } from "./ScaleAttendanceMemberItem";

interface ScaleAttendanceScreenProps {
  scaleId: string;
  readOnly?: boolean;
}

export function ScaleAttendanceScreen({
  scaleId,
  readOnly = false,
}: ScaleAttendanceScreenProps) {
  const {
    attendance,
    entries,
    summary,
    isLoading,
    isSaving,
    isPublishing,
    hasPendingChanges,
    hasMissingJustifications,
    missingJustificationIds,
    canEdit,
    canPublish,
    isServiceDateFuture,
    markStatus,
    updateJustification,
    save,
    publish,
  } = useScaleAttendanceScreen({ scaleId, readOnly });

  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) =>
        a.memberName.localeCompare(b.memberName, "pt-BR", {
          sensitivity: "base",
        }),
      ),
    [entries],
  );

  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "present" | "absent"
  >("all");

  const missingJustificationIdSet = useMemo(
    () => new Set(missingJustificationIds),
    [missingJustificationIds],
  );

  const isPublishDisabled =
    attendance?.status === "published" ||
    !canPublish ||
    isPublishing ||
    hasPendingChanges ||
    hasMissingJustifications;
  const visibleEntries = sortedEntries.filter((entry) => {
    if (filter === "all") return true;
    if (filter === "present") return entry.status === "present";
    if (filter === "pending") return entry.status === "pending";
    return (
      entry.status === "absent_excused" || entry.status === "absent_unexcused"
    );
  });

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Não foi possível carregar a chamada.
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {isServiceDateFuture && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3">
          <CalendarX className="mt-0.5 h-5 w-5 shrink-0 text-primary-selected" />
          <div>
            <p className="text-sm font-medium text-foreground">Data futura</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Esta escala é de uma data futura. A chamada não pode ser editada
              até o dia do culto.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-primary/20 bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-heading text-base font-semibold">
            Resumo da Chamada
          </p>
          <span className="text-xs font-medium text-muted-foreground">
            {attendance.status === "published" ? "Publicada" : "Rascunho"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-muted/40 p-2">
            Presentes: {summary.present}
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            Pendentes: {summary.pending}
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            Falta sem justificativa: {summary.absentUnexcused}
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            Falta justificada: {summary.absentExcused}
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 -mx-4 border-y border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium">Progresso da chamada</p>
          <p className="text-muted-foreground">
            {summary.present + summary.absentExcused + summary.absentUnexcused}/
            {entries.length} conferidos
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${entries.length ? ((summary.present + summary.absentExcused + summary.absentUnexcused) / entries.length) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(["all", "pending", "present", "absent"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-medium ${filter === item ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}
            >
              {
                {
                  all: "Todos",
                  pending: "Pendentes",
                  present: "Presentes",
                  absent: "Ausentes",
                }[item]
              }
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visibleEntries.map((entry) => (
          <ScaleAttendanceMemberItem
            key={entry.scaleMemberId}
            entry={entry}
            canEdit={canEdit}
            showJustificationError={missingJustificationIdSet.has(
              entry.scaleMemberId,
            )}
            onMarkStatus={markStatus}
            onUpdateJustification={updateJustification}
          />
        ))}
      </div>

      {readOnly ? (
        <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
          Esta chamada está em modo somente leitura.
        </div>
      ) : (
        <StickyActionBar className="flex-col sm:flex-row">
          <div className="flex-1 text-xs text-muted-foreground">
            {hasMissingJustifications
              ? "Preencha as justificativas pendentes."
              : hasPendingChanges
                ? "Alterações não salvas"
                : "Tudo salvo"}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-96">
            <Button
              onClick={save}
              disabled={
                !canEdit ||
                !hasPendingChanges ||
                isSaving ||
                hasMissingJustifications
              }
              className="h-11"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsPublishDialogOpen(true)}
              disabled={isPublishDisabled}
              className="h-11"
            >
              {attendance.status === "published" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Chamada publicada
                </>
              ) : (
                <>
                  <Clock3 className="w-4 h-4 mr-2" />
                  {isPublishing ? "Publicando..." : "Publicar chamada"}
                </>
              )}
            </Button>
          </div>
        </StickyActionBar>
      )}

      <AlertDialog
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publicar chamada</AlertDialogTitle>
            <AlertDialogDescription>
              Após publicar, a chamada ficará marcada como publicada. Somente
              usuários com permissão superior poderão editar depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void publish();
                setIsPublishDialogOpen(false);
              }}
            >
              Confirmar publicação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
