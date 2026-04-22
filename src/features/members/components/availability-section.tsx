"use client";

import type { UseFormReturn } from "react-hook-form";
import type { CreateMemberInput } from "@/application/dtos/member/CreateMemberDTO";
import { FormSelect } from "@/components/ui/form-select";
import { Checkbox } from "@/components/ui/checkbox";

interface AvailabilitySectionProps {
  form: UseFormReturn<CreateMemberInput>;
  disabled?: boolean;
}

const DAY_OPTIONS = [
  { value: "Sunday", label: "Domingo" },
  { value: "Monday", label: "Segunda" },
  { value: "Tuesday", label: "Terca" },
  { value: "Wednesday", label: "Quarta" },
  { value: "Thursday", label: "Quinta" },
  { value: "Friday", label: "Sexta" },
  { value: "Saturday", label: "Sabado" },
] as const;

export function AvailabilitySection({
  form,
  disabled = false,
}: AvailabilitySectionProps) {
  const mode = form.watch("availability.mode") || "BLOCK_LIST";
  const selectedDays = form.watch("availability.daysOfWeek") || [];

  const toggleDay = (day: (typeof DAY_OPTIONS)[number]["value"]) => {
    const hasDay = selectedDays.includes(day);

    if (hasDay) {
      form.setValue(
        "availability.daysOfWeek",
        selectedDays.filter((selectedDay) => selectedDay !== day),
        { shouldValidate: true },
      );
      return;
    }

    form.setValue("availability.daysOfWeek", [...selectedDays, day], {
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <FormSelect
        label="Regra de disponibilidade"
        value={mode}
        onChange={(value) => {
          form.setValue("availability.mode", value as "ALLOW_LIST" | "BLOCK_LIST", {
            shouldValidate: true,
          });
        }}
        options={[
          {
            value: "BLOCK_LIST",
            label: "Bloquear dias selecionados",
          },
          {
            value: "ALLOW_LIST",
            label: "Permitir somente dias selecionados",
          },
        ]}
        disabled={disabled}
      />

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {mode === "BLOCK_LIST"
            ? "O membro nao sera escalado nos dias marcados."
            : "O membro sera escalado somente nos dias marcados."}
        </p>

        <div className="grid grid-cols-2 gap-2">
          {DAY_OPTIONS.map((day) => {
            const checked = selectedDays.includes(day.value);
            return (
              <label
                key={day.value}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleDay(day.value)}
                  disabled={disabled}
                />
                <span>{day.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
