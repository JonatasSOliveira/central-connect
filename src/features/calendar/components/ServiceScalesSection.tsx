"use client";

import { AlertTriangle, ClipboardList, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { ShareScaleImageDialog } from "@/features/scales/components/ShareScaleImageDialog";
import type { ServiceScaleSummary } from "../hooks/useServiceScales";

interface ServiceScalesSectionProps {
  scales: ServiceScaleSummary[];
  isLoading: boolean;
  error: string | null;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  onCreate: () => void;
  onEdit: (scaleId: string) => void;
  onDelete: (scaleId: string) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

export function ServiceScalesSection({
  scales,
  isLoading,
  error,
  canCreate,
  canEdit,
  canDelete,
  canShare,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
}: ServiceScalesSectionProps) {
  const [scaleToDelete, setScaleToDelete] = useState<ServiceScaleSummary | null>(null);
  const [scaleToShare, setScaleToShare] = useState<ServiceScaleSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!scaleToDelete) return;
    setIsDeleting(true);
    const deleted = await onDelete(scaleToDelete.id);
    setIsDeleting(false);
    if (deleted) {
      setScaleToDelete(null);
      toast.success("Escala excluída com sucesso.");
      await onRefresh();
    } else {
      toast.error("Não foi possível excluir a escala.");
    }
  };

  return (
    <section aria-labelledby="service-scales-title" className="space-y-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Organização
          </p>
          <h2 id="service-scales-title" className="mt-1 font-heading text-lg font-bold">
            Escalas deste culto
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Uma escala para cada ministério participante.</p>
        </div>
        {canCreate && scales.length > 0 && (
          <Button type="button" className="w-full sm:w-auto" onClick={onCreate}>
            <Plus aria-hidden="true" />
            Nova escala
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Carregando escalas...
        </div>
      )}
      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      {!isLoading && !error && scales.length === 0 && (
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 text-center">
          <ClipboardList className="mx-auto size-8 text-primary" aria-hidden="true" />
          <p className="mt-2 font-semibold text-foreground">Nenhuma escala criada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie uma escala para organizar os participantes de um ministério.
          </p>
          {canCreate && (
            <Button type="button" className="mt-4" onClick={onCreate}>
              <Plus aria-hidden="true" />
              Criar primeira escala
            </Button>
          )}
        </div>
      )}
      {!isLoading && !error && scales.length > 0 && (
        <div className="grid gap-3">
          {scales.map((scale) => (
            <article key={scale.id} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:shadow-[var(--shadow-soft-sm)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{scale.ministryName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {scale.memberCount} participante{scale.memberCount === 1 ? "" : "s"} escalado{scale.memberCount === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {scale.status === "published" ? "Publicada" : "Rascunho"}
                </span>
              </div>
              {(canEdit || canDelete || (canShare && scale.status === "published")) && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                  {canEdit && (
                    <Button type="button" size="sm" onClick={() => onEdit(scale.id)}>
                      <Pencil aria-hidden="true" />
                      Editar
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setScaleToDelete(scale)}
                    >
                      <Trash2 aria-hidden="true" />
                      Excluir
                    </Button>
                  )}
                  {canShare && scale.status === "published" && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setScaleToShare(scale)}>
                      <Share2 aria-hidden="true" />
                      Compartilhar escala
                    </Button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <AlertDialog open={Boolean(scaleToDelete)} onOpenChange={(open) => !open && setScaleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle aria-hidden="true" />
            </div>
            <AlertDialogTitle>Excluir escala de {scaleToDelete?.ministryName}?</AlertDialogTitle>
            <AlertDialogDescription>
              O culto continuará cadastrado. Apenas esta escala será removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir escala"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {scaleToShare && (
        <ShareScaleImageDialog
          open={Boolean(scaleToShare)}
          onOpenChange={(open) => !open && setScaleToShare(null)}
          scaleId={scaleToShare.id}
        />
      )}
    </section>
  );
}
