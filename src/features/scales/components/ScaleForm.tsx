"use client";

import { Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FormTemplate } from "@/components/templates/form-template";
import { Button } from "@/components/ui/button";
import { MinistrySelect } from "@/components/ui/ministry-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ServiceSelect } from "@/components/ui/service-select";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ScaleFormInput } from "@/modules/scales/presentation/contracts/ScaleDTO";
import { Permission } from "@/shared/domain/enums/Permission";
import { useScaleForm } from "../hooks/useScaleForm";
import { ScaleRoleList } from "./ScaleRoleList";
import { ShareScaleImageDialog } from "./ShareScaleImageDialog";

interface ScaleFormProps {
  mode: "create" | "edit";
  scaleId?: string;
  initialServiceId?: string;
  onSuccess?: (scaleId?: string) => void;
  onCancel?: () => void;
}

export function ScaleForm({
  mode,
  scaleId,
  initialServiceId,
  onSuccess,
  onCancel,
}: ScaleFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const canSharePublishedScale = Boolean(
    user?.isSuperAdmin || user?.permissions.includes(Permission.SCALE_READ),
  );
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
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
  } = useScaleForm({ mode, scaleId, initialServiceId, onSuccess });

  const handleMinistryChange = useCallback(
    (value: string) => {
      form.setValue("ministryId", value, {
        shouldValidate: true,
        shouldDirty: true,
      });
      editableFields
        .map((_, index) => index)
        .reverse()
        .forEach((index) => {
          editableRemove(index);
        });
    },
    [editableFields, editableRemove, form],
  );

  const handleCancel = useCallback(() => {
    if (onCancel) onCancel();
    else router.push("/scales");
  }, [onCancel, router]);

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
              disabled={Boolean(initialServiceId)}
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
              onChange={handleMinistryChange}
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

          <ScaleRoleList
            form={form}
            ministryId={form.watch("ministryId") || ""}
            editableFields={editableFields}
            editableAppend={editableAppend}
            editableRemove={editableRemove}
            availableMembers={availableMembers}
            availableRoles={availableRoles}
            isLoadingMembers={isLoadingMembers}
            isLoadingRoles={isLoadingRoles}
          />

          {mode === "edit" &&
            scaleId &&
            form.watch("status") === "published" && (
              <div className="rounded-xl border border-primary/20 bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Esta escala está publicada. Gere uma imagem com todos os dados
                  e compartilhe no WhatsApp.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => setShareDialogOpen(true)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar imagem da escala
                </Button>
              </div>
            )}
        </FormTemplate.Content>

        <FormTemplate.Footer
          onCancel={handleCancel}
          isLoading={isLoading}
          submitLabel={mode === "edit" ? "Salvar" : "Criar"}
        />
      </FormTemplate.Form>

      {mode === "edit" && scaleId && canSharePublishedScale ? (
        <ShareScaleImageDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          scaleId={scaleId}
        />
      ) : null}
    </FormTemplate>
  );
}
