"use client";

import { AlertTriangle, Loader2, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MinistrySelect } from "@/components/ui/ministry-select";
import { ServiceSelect } from "@/components/ui/service-select";
import { useGenerateScale } from "../hooks/useGenerateScale";

interface GenerateScaleDialogProps {
  onSuccess?: () => void;
}

export function GenerateScaleDialog({ onSuccess }: GenerateScaleDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [ministryId, setMinistryId] = useState("");
  const {
    services,
    ministries,
    isLoadingOptions,
    isGenerating,
    isCheckingExisting,
    existingScale,
    checkError,
    loadOptions,
    checkExistingScale,
    resetExistingScaleCheck,
    generateScale,
  } = useGenerateScale();

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen, loadOptions]);

  useEffect(() => {
    if (!isOpen) return;
    if (!serviceId || !ministryId) {
      resetExistingScaleCheck();
      return;
    }
    const timeoutId = setTimeout(
      () => void checkExistingScale({ serviceId, ministryId }),
      200,
    );
    return () => clearTimeout(timeoutId);
  }, [isOpen, serviceId, ministryId, checkExistingScale, resetExistingScaleCheck]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) return;
    setServiceId("");
    setMinistryId("");
    resetExistingScaleCheck();
  };

  const handleOpenExistingScale = () => {
    if (!existingScale?.id) return;
    setIsOpen(false);
    setServiceId("");
    setMinistryId("");
    resetExistingScaleCheck();
    router.push(`/scales/${existingScale.id}/edit`);
  };

  const handleGenerate = async () => {
    if (!serviceId || !ministryId) return;
    const result = await generateScale({ serviceId, ministryId });
    if (!result.ok) return;
    setIsOpen(false);
    setServiceId("");
    setMinistryId("");
    onSuccess?.();
    if (result.scaleId) {
      router.push(`/scales/${result.scaleId}/edit`);
    }
  };

  const hasSelection = Boolean(serviceId && ministryId);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <WandSparkles className="w-4 h-4 mr-2" />
        Gerar escala automática
      </Button>

      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar escala automaticamente</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione o culto e ministério para montar a escala com base nas
              regras configuradas.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-3">
            <ServiceSelect
              label="Culto"
              value={serviceId}
              onChange={setServiceId}
              services={services}
              fromToday
              disabled={isLoadingOptions || isGenerating}
              required
            />

            <MinistrySelect
              label="Ministério"
              value={ministryId}
              onChange={setMinistryId}
              ministries={ministries}
              placeholder="Selecione um ministério"
              searchPlaceholder="Pesquisar ministério..."
              emptyText="Nenhum ministério encontrado"
              disabled={isLoadingOptions || isGenerating}
              required
            />

            {hasSelection && isCheckingExisting && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Verificando escala existente...
              </div>
            )}

            {hasSelection && !isCheckingExisting && existingScale && (
              <div className="rounded-md border border-amber-300/70 bg-amber-50 px-3 py-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-900">
                      Ja existe uma escala para este culto e ministerio.
                    </p>
                    <p className="text-xs text-amber-800">
                      Status: {existingScale.status === "published" ? "Publicada" : "Rascunho"}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
                  onClick={handleOpenExistingScale}
                  disabled={isGenerating}
                >
                  Abrir escala existente
                </Button>
              </div>
            )}

            {hasSelection && !isCheckingExisting && !existingScale && checkError && (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {checkError}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isGenerating}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              disabled={
                isLoadingOptions ||
                isGenerating ||
                isCheckingExisting ||
                !serviceId ||
                !ministryId ||
                Boolean(existingScale)
              }
              onClick={handleGenerate}
            >
              {isGenerating ? "Gerando..." : "Gerar escala"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
