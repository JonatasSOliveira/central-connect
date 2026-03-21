"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChurchFormData } from "@/application/dtos/church/ChurchDTO";
import { PrivateHeader } from "@/components/modules/private-header";
import { Form, FormTemplate } from "@/components/templates/form-template";
import { FormField } from "@/components/ui/form-field";
import { useChurchForm } from "@/features/churches/hooks/useChurchForm";

interface ChurchFormProps {
  mode: "create" | "edit";
  churchId?: string;
  backHref?: string;
}

export function ChurchForm({
  mode,
  churchId,
  backHref = "/home",
}: ChurchFormProps) {
  const router = useRouter();
  const { form, isLoading, isFetching, onSubmit } = useChurchForm({
    mode,
    churchId,
  });

  const handleCancel = () => {
    router.push(backHref);
  };

  const isEdit = mode === "edit";
  const title = isEdit ? "Editar Igreja" : "Nova Igreja";
  const subtitle = isEdit
    ? "Altere os dados da igreja"
    : "Preencha os dados da igreja";

  if (isFetching) {
    return (
      <div className="px-4 py-6">
        <PrivateHeader title={title} subtitle={subtitle} backHref={backHref} />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <PrivateHeader title={title} subtitle={subtitle} backHref={backHref} />

      <FormTemplate>
        <Form<ChurchFormData> form={form} onSubmit={onSubmit}>
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
            submitLabel={isEdit ? "Salvar" : "Criar"}
          />
        </Form>
      </FormTemplate>
    </div>
  );
}
