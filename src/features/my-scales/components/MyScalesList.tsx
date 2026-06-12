"use client";

import { CalendarCheck2, Clock3, History, ListChecks } from "lucide-react";
import { ListTemplate } from "@/components/templates/list-template";
import { cn } from "@/lib/utils";
import { useMyScales } from "../hooks/useMyScales";

function formatServiceDate(dateValue: string): string {
  const date = new Date(dateValue);

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatServiceWeekday(dateValue: string): string {
  const date = new Date(dateValue);

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
  });
}

function getServiceDateBadge(dateValue: string): string | null {
  const serviceDate = new Date(dateValue);
  const today = new Date();

  const normalize = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  const serviceTime = normalize(serviceDate);
  const todayTime = normalize(today);
  const tomorrowTime = normalize(new Date(todayTime + 24 * 60 * 60 * 1000));

  if (serviceTime === todayTime) {
    return "HOJE";
  }

  if (serviceTime === tomorrowTime) {
    return "AMANHA";
  }

  return null;
}

function PeriodButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof CalendarCheck2;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </span>
    </button>
  );
}

export function MyScalesList() {
  const { period, setPeriod, scales, isLoading } = useMyScales();
  const isUpcoming = period === "upcoming";

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Minhas escalas"
        subtitle={
          isUpcoming
            ? "Escalas de hoje e próximas"
            : "Escalas em que você já serviu"
        }
      />

      <div className="mb-4 flex gap-2">
        <PeriodButton
          active={isUpcoming}
          icon={CalendarCheck2}
          label="Atuais e futuras"
          onClick={() => setPeriod("upcoming")}
        />
        <PeriodButton
          active={!isUpcoming}
          icon={History}
          label="Já servidas"
          onClick={() => setPeriod("past")}
        />
      </div>

      {scales.length === 0 ? (
        <ListTemplate.EmptyState
          icon={ListChecks}
          title={
            isUpcoming
              ? "Nenhuma escala futura encontrada"
              : "Nenhuma escala passada encontrada"
          }
          description={
            isUpcoming
              ? "Quando você for escalado, suas próximas escalas aparecerão aqui."
              : "Suas escalas anteriores aparecerão aqui após a data do culto."
          }
        />
      ) : (
        <ListTemplate.List>
          {scales.map((scale) => {
            const serviceDateBadge = getServiceDateBadge(scale.serviceDate);

            return (
              <div
                key={`${scale.scaleId}-${scale.ministryRoleId}`}
                className="rounded-xl border border-border/50 bg-card p-4"
              >
                {serviceDateBadge && (
                  <p className="mb-2 inline-flex rounded-full bg-primary px-2 py-1 text-[10px] font-bold tracking-wide text-primary-foreground">
                    {serviceDateBadge}
                  </p>
                )}
                <p className="font-semibold text-foreground">{scale.serviceTitle}</p>
                <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Data do culto
                  </p>
                  <p className="mt-1 font-heading text-2xl font-bold leading-none text-primary">
                    {formatServiceDate(scale.serviceDate)}
                  </p>
                  <p className="mt-1 text-xs font-medium capitalize text-primary/90">
                    {formatServiceWeekday(scale.serviceDate)}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <Clock3 className="h-4 w-4" />
                    {scale.serviceTime}
                  </p>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Ministério:</span>{" "}
                    <span className="text-foreground">{scale.ministryName}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Função:</span>{" "}
                    <span className="text-foreground">{scale.ministryRoleName}</span>
                  </p>
                  {scale.memberNotes && (
                    <p>
                      <span className="text-muted-foreground">Observação:</span>{" "}
                      <span className="text-foreground">{scale.memberNotes}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </ListTemplate.List>
      )}
    </ListTemplate>
  );
}
