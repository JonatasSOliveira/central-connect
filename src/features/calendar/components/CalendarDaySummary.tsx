import { CalendarPlus, Clock3, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceListItem } from "@/features/services/hooks/useServices";
import {
  formatCalendarDate,
} from "@/features/calendar/utils/calendar-period-label";
import {
  formatServiceTime,
  getServiceDatePart,
} from "@/features/services/utils/service-date";

interface CalendarDaySummaryProps {
  date: string;
  services: ServiceListItem[];
  canCreateService: boolean;
  onCreate: () => void;
  onEdit: (serviceId: string) => void;
}

export function CalendarDaySummary({
  date,
  services,
  canCreateService,
  onCreate,
  onEdit,
}: CalendarDaySummaryProps) {
  const dateValue = new Date(`${date}T12:00:00`);

  return (
    <section className="mx-2 mt-3 rounded-xl border border-primary/20 bg-card p-4 shadow-[var(--shadow-soft-sm)] sm:mx-4 lg:mx-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Dia selecionado
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold text-foreground">
            {formatCalendarDate(dateValue)}
          </h3>
        </div>
        {canCreateService && (
          <Button type="button" size="sm" onClick={onCreate}>
            <CalendarPlus aria-hidden="true" />
            Adicionar culto
          </Button>
        )}
      </div>

      {services.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhum culto cadastrado para este dia.
        </p>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              className="flex min-w-0 flex-col items-start rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onEdit(service.id)}
            >
              <span className="flex items-center gap-1 text-sm font-bold text-primary">
                <Clock3 className="size-4" aria-hidden="true" />
                {formatServiceTime(service.time)}
              </span>
              <span className="mt-1 truncate max-w-full font-semibold text-foreground">
                {service.title}
              </span>
              {service.location && (
                <span className="mt-1 flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" aria-hidden="true" />
                  {service.location}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function servicesForDate(
  services: ServiceListItem[],
  date: string,
): ServiceListItem[] {
  return services
    .filter((service) => getServiceDatePart(service.date) === date)
    .sort((first, second) => first.time.localeCompare(second.time));
}
