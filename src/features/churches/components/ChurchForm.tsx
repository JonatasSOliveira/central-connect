"use client";

import { useRouter } from "next/navigation";
import { FormTemplate } from "@/components/templates/form-template";
import { FormField } from "@/components/ui/form-field";
import { NumberStepper } from "@/components/ui/number-stepper";
import { RoleSelect } from "@/components/ui/role-select";
import { SelfSignupShareDialog } from "@/features/churches/components/SelfSignupShareDialog";
import { useChurchForm } from "@/features/churches/hooks/useChurchForm";
import type { ChurchFormData } from "@/modules/churches/presentation/contracts/church/ChurchDTO";

interface ChurchFormProps {
  mode: "create" | "edit";
  churchId?: string;
  readOnly?: boolean;
}

export function ChurchForm({
  mode,
  churchId,
  readOnly = false,
}: ChurchFormProps) {
  const router = useRouter();
  const { form, roles, isLoading, isFetching, onSubmit } = useChurchForm({
    mode,
    churchId,
  });

  const handleCancel = () => {
    router.push("/churches");
  };

  if (isFetching) {
    return (
      <div
        className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm">Carregando dados da igreja...</p>
      </div>
    );
  }

  return (
    <FormTemplate>
      <FormTemplate.Form<ChurchFormData> form={form} onSubmit={onSubmit}>
        <FormTemplate.Content className="space-y-4 pt-0">
          <FormTemplate.Section
            id="church-data-heading"
            title="Dados da igreja"
            description="Informe o nome que será exibido no Central Connect."
          >
            <FormField<ChurchFormData>
              form={form}
              name="name"
              label="Nome da igreja"
              placeholder="Digite o nome da igreja"
              required
              disabled={readOnly}
              autoFocus={!readOnly}
            />
          </FormTemplate.Section>

          <FormTemplate.Section
            id="scale-settings-heading"
            title="Configurações de escala"
            description="Defina regras para distribuir as escalas com equilíbrio."
          >
            <NumberStepper
              id="maxConsecutiveScalesPerMember"
              label="Limite de escalas consecutivas por pessoa"
              value={Number(form.watch("maxConsecutiveScalesPerMember")) || 2}
              onChange={(value) => {
                form.setValue("maxConsecutiveScalesPerMember", value, {
                  shouldValidate: true,
                });
              }}
              min={1}
              max={10}
              error={
                form.formState.errors.maxConsecutiveScalesPerMember
                  ?.message as string
              }
              disabled={readOnly}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Evita que a mesma pessoa seja escalada várias vezes seguidas.
            </p>
          </FormTemplate.Section>

          <FormTemplate.Section
            id="member-signup-heading"
            title="Cadastro de novos membros"
            description="Defina uma opção inicial para os cadastros feitos pelo link ou QR Code."
          >
            <div className="space-y-2">
              <RoleSelect
                id="selfSignupDefaultRoleId"
                label="Cargo inicial — opcional"
                value={form.watch("selfSignupDefaultRoleId") || ""}
                onChange={(value) => {
                  form.setValue("selfSignupDefaultRoleId", value, {
                    shouldValidate: true,
                  });
                }}
                roles={roles}
                allOptionLabel="Nenhum cargo definido"
                placeholder="Selecione um cargo"
                searchPlaceholder="Pesquisar cargos"
                emptyText="Nenhum cargo disponível"
                disabled={readOnly}
              />
              {form.formState.errors.selfSignupDefaultRoleId?.message && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.selfSignupDefaultRoleId.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Você poderá alterar essa configuração depois.
              </p>

              {mode === "edit" && churchId && !readOnly ? (
                <div className="pt-1">
                  <SelfSignupShareDialog
                    churchId={churchId}
                    churchName={form.watch("name")}
                  />
                </div>
              ) : null}
            </div>
          </FormTemplate.Section>
        </FormTemplate.Content>

        {!readOnly && (
          <FormTemplate.Footer
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel={
              mode === "edit" ? "Salvar alterações" : "Cadastrar igreja"
            }
          />
        )}
      </FormTemplate.Form>
    </FormTemplate>
  );
}
