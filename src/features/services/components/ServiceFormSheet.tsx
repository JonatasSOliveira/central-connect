"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
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
import { ServiceForm } from "./service-form";

interface ServiceFormSheetProps {
  open: boolean;
  mode: "create" | "edit";
  serviceId?: string;
  initialDate?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onDelete?: (serviceId: string) => Promise<boolean>;
}

export function ServiceFormSheet({
  open,
  mode,
  serviceId,
  initialDate,
  onOpenChange,
  onSuccess,
  onDelete,
}: ServiceFormSheetProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  const handleDelete = async () => {
    if (!serviceId || !onDelete) return;

    setIsDeleting(true);
    const deleted = await onDelete(serviceId);
    setIsDeleting(false);

    if (!deleted) {
      toast.error("Não foi possível excluir o culto. Tente novamente.");
      return;
    }

    setIsDeleteDialogOpen(false);
    toast.success("Culto excluído com sucesso.");
    onSuccess();
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Fechar cadastro de culto"
        className="absolute inset-0 cursor-default bg-black/35"
        onClick={() => onOpenChange(false)}
      />
      <aside
        aria-label={mode === "edit" ? "Editar culto" : "Novo culto"}
        aria-modal="true"
        className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-border bg-background p-4 shadow-2xl sm:p-6"
        role="dialog"
      >
        <div className="mb-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Fechar"
            onClick={() => onOpenChange(false)}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <ServiceForm
          mode={mode}
          serviceId={serviceId}
          initialDate={initialDate}
          layout="sheet"
          goBack={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
        {mode === "edit" && serviceId && onDelete && (
          <div className="mt-8 border-t border-destructive/20 pt-5">
            <p className="mb-3 text-sm text-muted-foreground">
              A exclusão remove este culto do calendário da igreja.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              <Trash2 aria-hidden="true" />
              Excluir culto
            </Button>
          </div>
        )}
      </aside>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle aria-hidden="true" />
            </div>
            <AlertDialogTitle>Excluir este culto?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O culto será removido do
              calendário e não poderá mais ser editado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir culto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>,
    document.body,
  );
}
