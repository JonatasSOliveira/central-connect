"use client";

import { ArrowLeft, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScaleForm } from "@/features/scales/components/ScaleForm";

interface ScaleFormSheetProps {
  open: boolean;
  mode: "create" | "edit";
  serviceId: string;
  scaleId?: string;
  onBack: () => void;
  onSuccess: (scaleId?: string) => void;
}

export function ScaleFormSheet({
  open,
  mode,
  serviceId,
  scaleId,
  onBack,
  onSuccess,
}: ScaleFormSheetProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Fechar formulário de escala"
        className="absolute inset-0 cursor-default bg-black/35"
        onClick={onBack}
      />
      <aside
        aria-label={mode === "create" ? "Nova escala" : "Editar escala"}
        aria-modal="true"
        className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-border bg-background shadow-2xl"
        role="dialog"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
            Voltar para o culto
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Fechar" onClick={onBack}>
            <X aria-hidden="true" />
          </Button>
        </div>
        <div className="shrink-0 px-4 pb-5 pt-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {mode === "create" ? "Nova escala" : "Editar escala"}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-foreground">
            Organize os participantes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecione o ministério e as pessoas que participarão deste culto.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 sm:px-6 sm:pb-6">
          <ScaleForm
            key={`${mode}-${scaleId ?? "new"}-${serviceId}`}
            mode={mode}
            scaleId={scaleId}
            initialServiceId={serviceId}
            onCancel={onBack}
            onSuccess={onSuccess}
          />
        </div>
      </aside>
    </div>,
    document.body,
  );
}
