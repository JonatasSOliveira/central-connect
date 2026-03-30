"use client";

import { useRouter } from "next/navigation";
import type { ChurchFormData } from "@/application/dtos/church/ChurchDTO";
import { FormTemplate } from "@/components/templates/form-template";
import { FormField } from "@/components/ui/form-field";
import { useChurchForm } from "@/features/churches/hooks/useChurchForm";

interface ChurchFormProps {
  mode: "create" | "edit";
  churchId?: string;
}

export function ChurchForm({ mode, churchId }: ChurchFormProps) {
  const router = useRouter();
  const { form, isLoading, isFetching, onSubmit } = useChurchForm({
    mode,
    churchId,
  });

  const handleCancel = () => {
    router.push("/home");
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <FormTemplate>
      <FormTemplate.Form<ChurchFormData> form={form} onSubmit={onSubmit}>
        <FormTemplate.Content>
          <FormField<ChurchFormData>
            form={form}
            name="name"
            label="Nome"
            placeholder="Nome da igreja"
            required
          />
        </FormTemplate.Content>

        <FormTemplate.Footer
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel={mode === "edit" ? "Salvar" : "Criar"}
        />
      </FormTemplate.Form>
    </FormTemplate>
  );
}
