"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { FormTemplate } from "@/components/templates/form-template";
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
            <label className="text-sm font-medium text-muted-foreground">
              Culto <span className="text-destructive">*</span>
            </label>
            <select
              {...form.register("serviceId")}
              className="flex h-12 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Selecione um culto</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
            {form.formState.errors.serviceId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.serviceId.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Ministério <span className="text-destructive">*</span>
            </label>
            <select
              {...form.register("ministryId")}
              className="flex h-12 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Selecione um ministério</option>
              {ministries.map((ministry) => (
                <option key={ministry.id} value={ministry.id}>
                  {ministry.name}
                </option>
              ))}
            </select>
            {form.formState.errors.ministryId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.ministryId.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Status
            </label>
            <select
              {...form.register("status")}
              className="flex h-12 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicada</option>
            </select>
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
