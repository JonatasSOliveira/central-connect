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
import { ScaleAttendanceMemberItem } from "./ScaleAttendanceMemberItem";
import { useScaleAttendanceScreen } from "../hooks/useScaleAttendanceScreen";

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
    <div className="space-y-4">
      {isServiceDateFuture && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-3">
          <CalendarX className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
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

      <div className="space-y-3">
        {sortedEntries.map((entry) => (
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
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              {hasPendingChanges ? "Alterações não salvas" : "Tudo salvo"}
            </p>
            {hasPendingChanges && (
              <span
                className="h-2 w-2 rounded-full bg-primary"
                aria-hidden="true"
              />
            )}
          </div>

          {hasMissingJustifications && (
            <p className="mb-2 text-xs text-destructive">
              Preencha todas as justificativas para salvar ou publicar.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>
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
