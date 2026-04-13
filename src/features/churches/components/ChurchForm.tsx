"use client";

import { useRouter } from "next/navigation";
import type { ChurchFormData } from "@/application/dtos/church/ChurchDTO";
import { FormTemplate } from "@/components/templates/form-template";
import { FormField } from "@/components/ui/form-field";
import { FormSelect } from "@/components/ui/form-select";
import { useChurchForm } from "@/features/churches/hooks/useChurchForm";

interface ChurchFormProps {
  mode: "create" | "edit";
  churchId?: string;
}

export function ChurchForm({ mode, churchId }: ChurchFormProps) {
  const router = useRouter();
  const { form, roles, isLoading, isFetching, onSubmit } = useChurchForm({
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

          <div className="space-y-2">
            <FormSelect
              label="Cargo padrão para auto cadastro"
              value={form.watch("selfSignupDefaultRoleId") || ""}
              onChange={(value) => {
                form.setValue("selfSignupDefaultRoleId", value, {
                  shouldValidate: true,
                });
              }}
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
              placeholder="Selecione um cargo (opcional)"
              error={form.formState.errors.selfSignupDefaultRoleId?.message}
            />
            <p className="text-xs text-muted-foreground">
              Esse cargo será aplicado automaticamente em novos membros que se
              cadastrarem pelo link ou QR Code da igreja.
            </p>
          </div>
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
