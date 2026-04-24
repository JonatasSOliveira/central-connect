"use client";

import { WandSparkles } from "lucide-react";
import { useState } from "react";
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
import { FormSelect } from "@/components/ui/form-select";
import { useGenerateScale } from "../hooks/useGenerateScale";

interface GenerateScaleDialogProps {
  onSuccess?: () => void;
}

export function GenerateScaleDialog({ onSuccess }: GenerateScaleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [ministryId, setMinistryId] = useState("");

  const {
    serviceOptions,
    ministryOptions,
    isLoadingOptions,
    isGenerating,
    loadOptions,
    generateScale,
  } = useGenerateScale();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadOptions();
      return;
    }

    setServiceId("");
    setMinistryId("");
  };

  const handleGenerate = async () => {
    if (!serviceId || !ministryId) {
      return;
    }

    const success = await generateScale({ serviceId, ministryId });
    if (!success) {
      return;
    }

    setIsOpen(false);
    setServiceId("");
    setMinistryId("");
    onSuccess?.();
  };

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
            <FormSelect
              label="Culto"
              value={serviceId}
              onChange={setServiceId}
              options={serviceOptions}
              placeholder="Selecione um culto"
              disabled={isLoadingOptions || isGenerating}
              required
            />

            <FormSelect
              label="Ministério"
              value={ministryId}
              onChange={setMinistryId}
              options={ministryOptions}
              placeholder="Selecione um ministério"
              disabled={isLoadingOptions || isGenerating}
              required
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isGenerating}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              disabled={isLoadingOptions || isGenerating || !serviceId || !ministryId}
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
