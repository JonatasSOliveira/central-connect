import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarToolbarProps {
  title: string;
  currentView: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onChangeView: (view: string) => void;
  onCreateService?: () => void;
  className?: string;
}

const views = [
  { value: "month", label: "Mês", icon: CalendarDays },
  { value: "week", label: "Semana", icon: CalendarRange },
  { value: "day", label: "Dia", icon: CalendarClock },
  { value: "list", label: "Lista", icon: List },
];

export function CalendarToolbar({
  title,
  currentView,
  onPrevious,
  onNext,
  onToday,
  onChangeView,
  onCreateService,
  className,
}: CalendarToolbarProps) {
  return (
    <div
      className={cn(
        "mb-5 grid min-w-0 gap-3 border-b border-border bg-card px-4 pb-4 pt-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-5 lg:px-6 lg:pb-6 lg:pt-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Período anterior"
            onClick={onPrevious}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Próximo período"
            onClick={onNext}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            className="ml-1 gap-2"
            onClick={onToday}
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            Hoje
          </Button>
      </div>

      <h2 className="min-w-0 break-words font-heading text-lg font-bold text-foreground lg:text-center lg:text-2xl">
        {title}
      </h2>

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:justify-self-end">
        {onCreateService && (
          <Button type="button" className="w-full sm:w-auto" onClick={onCreateService}>
            <CalendarPlus className="size-4" aria-hidden="true" />
            Novo culto
          </Button>
        )}

        <fieldset
          className="flex w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-border bg-background/60 p-1 [scrollbar-width:none] lg:w-auto [&::-webkit-scrollbar]:hidden"
        >
          <legend className="sr-only">Visualização da agenda</legend>
          {views.map((view) => {
            const Icon = view.icon;

            return (
              <button
                key={view.value}
                type="button"
                aria-pressed={currentView === view.value}
                className={cn(
                  "inline-flex min-h-10 min-w-20 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-1",
                  currentView === view.value
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft-sm)]"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                )}
                onClick={() => onChangeView(view.value)}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {view.label}
              </button>
            );
          })}
        </fieldset>
      </div>
    </div>
  );
}
