"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { FormTemplate } from "@/components/templates/form-template";
import { MinistrySelect } from "@/components/ui/ministry-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ServiceSelect } from "@/components/ui/service-select";
import type { ScaleFormInput } from "@/application/dtos/scale/ScaleDTO";
import { ScaleMemberList } from "./ScaleMemberList";
import { useScaleForm } from "../hooks/useScaleForm";

interface ScaleFormProps {
  mode: "create" | "edit";
  scaleId?: string;
}

export function ScaleForm({ mode, scaleId }: ScaleFormProps) {
  const router = useRouter();
  const {
    form,
    editableFields,
    editableAppend,
    editableRemove,
    isLoading,
    isFetching,
    onSubmit,
    services,
    ministries,
    availableMembers,
    availableRoles,
    isLoadingMembers,
    isLoadingRoles,
  } = useScaleForm({ mode, scaleId });

  const handleCancel = useCallback(() => {
    router.push("/scales");
  }, [router]);

  const handleAddMember = useCallback(() => {
    editableAppend({ memberId: "", ministryRoleId: "", notes: "", id: null });
  }, [editableAppend]);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <FormTemplate>
      <FormTemplate.Form<ScaleFormInput> form={form} onSubmit={onSubmit}>
        <FormTemplate.Content>
          <div className="space-y-1">
            <ServiceSelect
              label="Culto"
              value={form.watch("serviceId") || ""}
              onChange={(value) => {
                form.setValue("serviceId", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                form.setValue("ministryId", "", {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              services={services}
              placeholder="Selecione um culto"
              required
            />
            {form.formState.errors.serviceId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.serviceId.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <MinistrySelect
              label="Ministério"
              value={form.watch("ministryId") || ""}
              onChange={(value) =>
                form.setValue("ministryId", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              ministries={ministries}
              placeholder="Selecione um ministério"
              required
            />
            {form.formState.errors.ministryId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.ministryId.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <SearchableSelect
              label="Status"
              value={form.watch("status") || "draft"}
              onChange={(value) =>
                form.setValue("status", value as "draft" | "published", {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={[
                { value: "draft", label: "Rascunho" },
                { value: "published", label: "Publicada" },
              ]}
              searchPlaceholder="Pesquisar status..."
              emptyText="Nenhum status encontrado"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Observações
            </label>
            <textarea
              {...form.register("notes")}
              placeholder="Observações opcionais"
              rows={3}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
            />
          </div>

          <ScaleMemberList
            form={form}
            editableFields={editableFields}
            editableRemove={editableRemove}
            onAddMember={handleAddMember}
            availableMembers={availableMembers}
            availableRoles={availableRoles}
            isLoadingMembers={isLoadingMembers}
            isLoadingRoles={isLoadingRoles}
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
