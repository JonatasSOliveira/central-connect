import { CalendarDays, Clock3, MapPin, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { ServiceListItem } from "../hooks/useServices";
import { formatServiceTime } from "../utils/service-date";

interface ServiceDetailsProps {
  service: ServiceListItem;
  canEdit: boolean;
  onEdit: () => void;
  children?: ReactNode;
}

export function ServiceDetails({
  service,
  canEdit,
  onEdit,
  children,
}: ServiceDetailsProps) {
  const date = new Date(`${service.date.slice(0, 10)}T12:00:00`);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-card p-4 shadow-[var(--shadow-soft-sm)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Informações do culto
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-foreground">
              {service.title}
            </h2>
          </div>
          {canEdit && (
            <Button type="button" size="sm" onClick={onEdit}>
              <Pencil aria-hidden="true" />
              Editar culto
            </Button>
          )}
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <dt className="text-xs text-muted-foreground">Data</dt>
              <dd className="font-medium capitalize text-foreground">
                {date.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <dt className="text-xs text-muted-foreground">Horário</dt>
              <dd className="font-medium text-foreground">
                {formatServiceTime(service.time)}
              </dd>
            </div>
          </div>
          {service.location && (
            <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3 sm:col-span-2">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <dt className="text-xs text-muted-foreground">Local</dt>
                <dd className="font-medium text-foreground">
                  {service.location}
                </dd>
              </div>
            </div>
          )}
        </dl>

        {service.description && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">Observações</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
              {service.description}
            </p>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
