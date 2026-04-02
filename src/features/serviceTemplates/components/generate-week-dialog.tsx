"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
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
import { useGenerateWeek } from "../hooks/useGenerateWeek";

interface GenerateWeekDialogProps {
  onSuccess?: () => void;
}

export function GenerateWeekDialog({ onSuccess }: GenerateWeekDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const { generateWeek, isLoading } = useGenerateWeek();

  const getNextMonday = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split("T")[0];
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedDate("");
    } else {
      setSelectedDate(getNextMonday());
    }
    setIsOpen(open);
  };

  const handleGenerate = async () => {
    if (!selectedDate) {
      toast.error("Selecione uma data");
      return;
    }

    const result = await generateWeek(new Date(selectedDate));

    if (result) {
      setIsOpen(false);
      toast.success(
        `${result.createdCount} culto(s) gerado(s), ${result.skippedCount} pulado(s)`,
      );
      onSuccess?.();
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Gerar Semana
      </Button>
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar Cultos da Semana</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione a data de início da semana para gerar os cultos
              automaticamente basedo nos modelos ativos.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium text-foreground">
              Data de início da semana
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex h-12 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base mt-1 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGenerate}
              disabled={isLoading || !selectedDate}
            >
              {isLoading ? "Gerando..." : "Gerar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
