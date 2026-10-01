"use client";

import type { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import type { CreateMemberInput } from "@/modules/members/presentation/contracts/member/CreateMemberDTO";
import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";
import { ALL_DAYS_OF_WEEK } from "@/shared/constants/daysOfWeek";

interface AvailabilitySectionProps {
  form: UseFormReturn<CreateMemberInput>;
  disabled?: boolean;
}

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: "Sunday", label: "Domingo" },
  { value: "Monday", label: "Segunda-feira" },
  { value: "Tuesday", label: "Terça-feira" },
  { value: "Wednesday", label: "Quarta-feira" },
  { value: "Thursday", label: "Quinta-feira" },
  { value: "Friday", label: "Sexta-feira" },
  { value: "Saturday", label: "Sábado" },
];

export function AvailabilitySection({
  form,
  disabled = false,
}: AvailabilitySectionProps) {
  const selectedDays = form.watch("availability.daysOfWeek") || [];

  const setDays = (value: DayOfWeek[]) => {
    form.setValue("availability.daysOfWeek", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setDays(selectedDays.filter((selectedDay) => selectedDay !== day));
      return;
    }

    setDays([...selectedDays, day]);
  };

  const selectedDayLabels = DAY_OPTIONS.filter((day) =>
    selectedDays.includes(day.value),
  ).map((day) => day.label.toLowerCase());

  const summary =
    selectedDays.length === 0
      ? "Nenhum dia selecionado. A pessoa não será incluída automaticamente nas escalas."
      : selectedDays.length === ALL_DAYS_OF_WEEK.length
        ? "Disponível todos os dias."
        : `Disponível em ${selectedDays.length} ${selectedDays.length === 1 ? "dia" : "dias"}: ${selectedDayLabels.join(", ")}.`;

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">
        Em quais dias essa pessoa pode participar?
      </legend>
      <p className="text-xs text-muted-foreground">
        Marque todos os dias em que ela pode ser incluída nas escalas.
      </p>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {DAY_OPTIONS.map((day) => (
          <label
            key={day.value}
            className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <Checkbox
              checked={selectedDays.includes(day.value)}
              onCheckedChange={() => toggleDay(day.value)}
              disabled={disabled}
            />
            <span>{day.label}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setDays([...ALL_DAYS_OF_WEEK])}
          disabled={disabled}
        >
          Selecionar todos
        </button>
        <button
          type="button"
          className="min-h-11 rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setDays([])}
          disabled={disabled}
        >
          Limpar seleção
        </button>
      </div>

      <p
        className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
        aria-live="polite"
      >
        <span className="font-medium text-foreground">Resumo: </span>
        {summary}
      </p>
    </fieldset>
  );
}
