"use client";

import { useRouter } from "next/navigation";
import { FormTemplate, Form } from "@/components/templates/form-template";
import { PrivateHeader } from "@/components/modules/private-header";
import { FormField } from "@/components/ui/form-field";
import { useChurchForm } from "@/features/churches/hooks/useChurchForm";
import type { ChurchFormData } from "@/application/dtos/church/ChurchDTO";

export default function ChurchFormPage() {
  const router = useRouter();
  const { form, isLoading, onSubmit } = useChurchForm({ mode: "create" });

  const handleCancel = () => {
    router.push("/churches");
  };

  return (
    <div className="px-4 py-6">
      <PrivateHeader
        title="Nova Igreja"
        subtitle="Preencha os dados da igreja"
        showBackButton
      />

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
          />
        </Form>
      </FormTemplate>
    </div>
  );
}
