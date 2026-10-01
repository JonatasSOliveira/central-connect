"use client";

import { useRouter } from "next/navigation";
import { FormTemplate } from "@/components/templates/form-template";
import { FormField } from "@/components/ui/form-field";
import { MemberSelect } from "@/components/ui/member-select";
import { useMinistryForm } from "@/features/ministries/hooks/useMinistryForm";
import { MinistryRolesEditor } from "@/features/ministries/components/MinistryRolesEditor";
import type { MinistryFormInput } from "@/modules/ministries/presentation/contracts/ministry/MinistryDTO";

interface MinistryFormProps {
  mode: "create" | "edit";
  ministryId?: string;
}

export function MinistryForm({ mode, ministryId }: MinistryFormProps) {
  const router = useRouter();
  const {
    form,
    editableFields,
    editableAppend,
    editableRemove,
    isLoading,
    isFetching,
    onSubmit,
    memberOptions,
  } = useMinistryForm({ mode, ministryId });

  if (isFetching) {
    return (
      <div
        className="flex h-64 items-center justify-center text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <div className="size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="sr-only">Carregando ministério...</span>
      </div>
    );
  }

  return (
    <FormTemplate>
      <FormTemplate.Form<MinistryFormInput> form={form} onSubmit={onSubmit}>
        <FormTemplate.Content className="space-y-4 pt-0">
          <FormTemplate.Section
            id="ministry-basic-data-heading"
            title="Dados do ministério"
            description="Informe o nome e, se quiser, quem é o líder responsável."
          >
            <FormField<MinistryFormInput>
              form={form}
              name="name"
              label="Nome do ministério"
              placeholder="Ex.: Louvor"
              required
              autoFocus={mode === "create"}
            />

            <MemberSelect
              label="Líder responsável (opcional)"
              value={form.watch("leaderId") || ""}
              onChange={(value) =>
                form.setValue("leaderId", value || null, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
              members={memberOptions}
              allOptionLabel="Nenhum líder definido"
              placeholder="Selecione um líder"
            />

            <FormField<MinistryFormInput>
              form={form}
              name="notes"
              label="Observações (opcional)"
              placeholder="Adicione alguma informação importante"
            />
          </FormTemplate.Section>

          <FormTemplate.Section
            id="ministry-roles-heading"
            title="Funções do ministério"
            description="Adicione as funções necessárias para montar as escalas. Essa etapa é opcional."
          >
            <MinistryRolesEditor
              form={form}
              fields={editableFields}
              append={editableAppend}
              remove={editableRemove}
            />
          </FormTemplate.Section>
        </FormTemplate.Content>

        <FormTemplate.Footer
          onCancel={() => router.push("/ministries")}
          isLoading={isLoading}
          submitLabel={
            mode === "edit" ? "Salvar alterações" : "Cadastrar ministério"
          }
        />
      </FormTemplate.Form>
    </FormTemplate>
  );
}
