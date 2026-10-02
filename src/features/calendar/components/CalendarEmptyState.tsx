import { CalendarDays } from "lucide-react";

interface CalendarEmptyStateProps {
  viewType?: string;
}

export function CalendarEmptyState({
  viewType = "dayGridMonth",
}: CalendarEmptyStateProps) {
  const periodLabel =
    viewType === "dayGridDay"
      ? "neste dia"
      : viewType === "dayGridWeek"
        ? "nesta semana"
        : "neste período";

  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CalendarDays className="size-6" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">
        Nenhum culto ou escala {periodLabel}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Os eventos cadastrados aparecerão aqui.
      </p>
    </div>
  );
}
