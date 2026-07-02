"use client";

import { BellRing } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

function getTodayValue(): string {
  return new Date().toISOString().slice(0, 10);
}

interface NotifySummary {
  serviceCount: number;
  scaleCount: number;
  targetedMembers: number;
  successCount: number;
  failureCount: number;
}

export function NotifyScalesByDateDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayValue);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(
    null,
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [summary, setSummary] = useState<NotifySummary | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedDate(getTodayValue());
      setFeedbackType(null);
      setFeedbackMessage("");
      setSummary(null);
    }
  };

  const handleNotify = async () => {
    if (!selectedDate) return;

    setIsSubmitting(true);
    setFeedbackType(null);
    setFeedbackMessage("");
    setSummary(null);

    try {
      const response = await fetch("/api/scales/notify-by-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        const message = data.error?.message || "Falha ao notificar os escalados";
        setFeedbackType("error");
        setFeedbackMessage(message);
        toast.error(message);
        return;
      }

      const nextSummary: NotifySummary = {
        serviceCount: data.value.serviceCount ?? 0,
        scaleCount: data.value.scaleCount ?? 0,
        targetedMembers: data.value.targetedMembers ?? 0,
        successCount: data.value.successCount ?? 0,
        failureCount: data.value.failureCount ?? 0,
      };
      setSummary(nextSummary);

      if (nextSummary.scaleCount === 0) {
        const message =
          "Nenhuma escala publicada foi encontrada para a data selecionada.";
        setFeedbackType("error");
        setFeedbackMessage(message);
        toast.info(message);
      } else if (nextSummary.targetedMembers === 0) {
        const message =
          "Nenhum membro escalado possui token ativo para receber notificação.";
        setFeedbackType("error");
        setFeedbackMessage(message);
        toast.info(message);
      } else {
        const message =
          nextSummary.failureCount === 0
            ? "Notificações enviadas com sucesso para todos os escalados."
            : "Notificação enviada parcialmente. Alguns envios falharam.";
        setFeedbackType(nextSummary.failureCount === 0 ? "success" : "error");
        setFeedbackMessage(message);
        toast.success(
          `Notificação enviada: ${nextSummary.successCount} sucesso(s), ${nextSummary.failureCount} falha(s).`,
        );
      }

    } catch {
      const message = "Erro ao enviar notificações. Tente novamente.";
      setFeedbackType("error");
      setFeedbackMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <BellRing className="w-4 h-4 mr-2" />
        Notificar escalados
      </Button>

      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notificar escalados por data</AlertDialogTitle>
            <AlertDialogDescription>
              Envie um lembrete para todos os membros das escalas publicadas na
              data selecionada.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium text-foreground">Data do culto</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 flex h-12 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
            />

            {feedbackType && (
              <div
                className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
                  feedbackType === "success"
                    ? "border-primary/30 bg-primary/10 text-primary-selected"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                <p className="font-medium">{feedbackMessage}</p>
                {summary && (
                  <p className="mt-1 text-xs">
                    Cultos: {summary.serviceCount} | Escalas publicadas: {summary.scaleCount} |
                    Membros alvo: {summary.targetedMembers} | Sucesso: {summary.successCount} |
                    Falhas: {summary.failureCount}
                  </p>
                )}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              onClick={handleNotify}
              disabled={isSubmitting || !selectedDate}
            >
              {isSubmitting ? "Notificando..." : "Notificar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
