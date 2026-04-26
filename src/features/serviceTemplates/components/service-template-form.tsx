"use client";

import { FormTemplate } from "@/components/templates/form-template";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useServiceTemplateForm } from "../hooks/useServiceTemplateForm";

interface ServiceTemplateFormProps {
  mode: "create" | "edit";
  templateId?: string;
  goBack: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ServiceTemplateForm({
  mode,
  templateId,
  goBack,
  onSuccess,
  onError,
}: ServiceTemplateFormProps) {
  const { form, isLoading, isFetching, onSubmit, isEdit } =
    useServiceTemplateForm({
      mode,
      templateId,
      goBack,
      onSuccess,
      onError,
    });

  const dayOfWeekOptions = [
    { value: "Sunday", label: "Domingo" },
    { value: "Monday", label: "Segunda-feira" },
    { value: "Tuesday", label: "Terça-feira" },
    { value: "Wednesday", label: "Quarta-feira" },
    { value: "Thursday", label: "Quinta-feira" },
    { value: "Friday", label: "Sexta-feira" },
    { value: "Saturday", label: "Sábado" },
  ];

  if (isFetching) {
    return (
      <FormTemplate>
        <FormTemplate.Header
          title={isEdit ? "Editar Modelo" : "Novo Modelo"}
          description={
            isEdit
              ? "Atualize os dados do modelo de culto"
              : "Preencha os dados do modelo de culto"
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
        title={isEdit ? "Editar Modelo" : "Novo Modelo"}
        description={
          isEdit
            ? "Atualize os dados do modelo de culto"
            : "Preencha os dados do modelo de culto"
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

          <SearchableSelect
            label="Dia da Semana"
            value={form.watch("dayOfWeek") || "Sunday"}
            onChange={(value) =>
              form.setValue(
                "dayOfWeek",
                value as
                  | "Sunday"
                  | "Monday"
                  | "Tuesday"
                  | "Wednesday"
                  | "Thursday"
                  | "Friday"
                  | "Saturday",
              )
            }
            options={dayOfWeekOptions}
            placeholder="Selecione"
            searchPlaceholder="Pesquisar dia..."
            emptyText="Nenhum dia encontrado"
          />

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

          <div className="flex items-center gap-3 py-2">
            <Checkbox
              checked={form.watch("isActive")}
              onCheckedChange={(checked) =>
                form.setValue("isActive", checked === true)
              }
            />
            <label className="text-sm font-medium text-foreground">Ativo</label>
          </div>
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
