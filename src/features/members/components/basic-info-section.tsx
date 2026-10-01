"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import { PhoneInput } from "@/components/ui/phone-input";
import type { CreateMemberInput } from "@/modules/members/presentation/contracts/member/CreateMemberDTO";

interface BasicInfoSectionProps {
  form: UseFormReturn<CreateMemberInput>;
  disabled?: boolean;
}

export function BasicInfoSection({
  form,
  disabled = false,
}: BasicInfoSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <FormField<CreateMemberInput>
          form={form}
          name="fullName"
          label="Nome completo"
          placeholder="Nome do membro"
          required
          disabled={disabled}
          autoFocus={!disabled}
        />
      </div>

      <FormField<CreateMemberInput>
        form={form}
        name="email"
        label="Email (opcional)"
        type="email"
        placeholder="email@exemplo.com (opcional)"
        disabled={disabled}
        description="Pode ser usado para comunicações e acesso futuro."
      />

      <FormField<CreateMemberInput>
        form={form}
        name="phone"
        label="Telefone (opcional)"
        description="Usado apenas para contato relacionado às escalas."
      >
        <PhoneInput
          id="phone"
          value={form.watch("phone") ?? ""}
          onChangeValue={(value) => {
            form.setValue("phone", value, { shouldValidate: true });
          }}
          onBlur={() => {
            form.trigger("phone");
          }}
          placeholder="(11) 99999-9999"
          disabled={disabled}
        />
      </FormField>
    </div>
  );
}
