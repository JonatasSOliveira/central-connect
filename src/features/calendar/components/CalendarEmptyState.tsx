import { CalendarDays } from "lucide-react";

export function CalendarEmptyState() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CalendarDays className="size-6" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">
        Nenhum culto ou escala neste período
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Os eventos cadastrados aparecerão aqui.
      </p>
    </div>
  );
}
