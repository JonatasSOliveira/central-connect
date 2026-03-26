"use client";

import type { UseFormReturn } from "react-hook-form";
import type { CreateMemberInput } from "@/application/dtos/member/CreateMemberDTO";
import { FormField } from "@/components/ui/form-field";

interface BasicInfoSectionProps {
  form: UseFormReturn<CreateMemberInput>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <>
      <FormField<CreateMemberInput> form={form} name="email" label="Email">
        <input
          type="email"
          placeholder="email@exemplo.com (opcional)"
          className="flex h-12 w-full rounded-lg border border-border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...form.register("email")}
        />
      </FormField>

      <FormField<CreateMemberInput>
        form={form}
        name="fullName"
        label="Nome completo"
        placeholder="Nome do membro"
        required
      />

      <FormField<CreateMemberInput>
        form={form}
        name="phone"
        label="Telefone"
        placeholder="(00) 00000-0000"
      />
    </>
  );
}
