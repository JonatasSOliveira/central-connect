"use client";

import { FormTemplate } from "@/components/templates/form-template";
import { FormField } from "@/components/ui/form-field";
import { useServiceForm } from "../hooks/useServiceForm";

interface ServiceFormProps {
  mode: "create" | "edit";
  serviceId?: string;
  goBack: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ServiceForm({
  mode,
  serviceId,
  goBack,
  onSuccess,
  onError,
}: ServiceFormProps) {
  const { form, isLoading, isFetching, onSubmit, isEdit } = useServiceForm({
    mode,
    serviceId,
    goBack,
    onSuccess,
    onError,
  });

  if (isFetching) {
    return (
      <FormTemplate>
        <FormTemplate.Header
          title={isEdit ? "Editar Culto" : "Novo Culto"}
          description={
            isEdit ? "Atualize os dados do culto" : "Preencha os dados do culto"
          }
        />
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </FormTemplate>
    );
  }

  return (
    <FormTemplate>
      <FormTemplate.Header
        title={isEdit ? "Editar Culto" : "Novo Culto"}
        description={
          isEdit ? "Atualize os dados do culto" : "Preencha os dados do culto"
        }
      />

      <FormTemplate.Form form={form} onSubmit={onSubmit}>
        <FormTemplate.Content>
          <FormField
            form={form}
            name="title"
            label="Título"
            placeholder="Ex: Culto de Domingo"
            required
          />

          <FormField
            form={form}
            name="date"
            label="Data"
            placeholder="Selecione a data"
            required
          >
            <input
              type="date"
              className="flex h-12 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
              {...form.register("date")}
            />
          </FormField>

          <FormField
            form={form}
            name="time"
            label="Horário"
            placeholder="Selecione o horário"
            required
          >
            <input
              type="time"
              className="flex h-12 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
              {...form.register("time")}
            />
          </FormField>

          <FormField
            form={form}
            name="location"
            label="Local"
            placeholder="Ex: Templo Central"
          />

          <FormField
            form={form}
            name="description"
            label="Descrição"
            placeholder="Observações adicionais"
          />
        </FormTemplate.Content>

        <FormTemplate.Footer
          onCancel={goBack}
          isLoading={isLoading}
          submitLabel={isEdit ? "Atualizar" : "Criar"}
          cancelLabel="Cancelar"
        />
      </FormTemplate.Form>
    </FormTemplate>
  );
}
