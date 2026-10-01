"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormTemplate } from "@/components/templates/form-template";
import { useMemberForm } from "@/features/members/hooks/useMemberForm";
import { shouldNavigateBack } from "@/features/members/utils/selfEditNavigation";
import type { CreateMemberInput } from "@/modules/members/presentation/contracts/member/CreateMemberDTO";
import { AvailabilitySection } from "./availability-section";
import { BasicInfoSection } from "./basic-info-section";
import { ChurchSection } from "./church-section";

interface MemberFormProps {
  mode: "create" | "edit";
  memberId?: string;
  readOnly?: boolean;
  isSelfEdit?: boolean;
}

export function MemberForm({
  mode,
  memberId,
  readOnly = false,
  isSelfEdit = false,
}: MemberFormProps) {
  const router = useRouter();
  const {
    form,
    editableFields,
    editableAppend,
    editableRemove,
    isLoading,
    isFetching,
    onSubmit,
    isEdit,
    roles,
    editableChurches,
    readonlyChurches,
    canChangeChurch,
    canEditSystemRole,
    canEditMinistries,
    canEditMinistryRoles,
    editableAppendMinistry,
    editableRemoveMinistry,
    getMinistryRoleIds,
    onToggleMinistryRole,
    clearChurchMinistryAssignments,
    getMinistriesByChurch,
    fetchMinistriesByChurch,
    isLoadingMinistries,
  } = useMemberForm({
    mode,
    memberId,
    isSelfEdit,
  });

  const hasSingleWritableChurch =
    editableChurches.length === 1 && canChangeChurch;
  const defaultEditableChurchId = hasSingleWritableChurch
    ? editableChurches[0]?.id
    : "";

  useEffect(() => {
    if (mode === "create" && hasSingleWritableChurch) {
      fetchMinistriesByChurch(defaultEditableChurchId);
    }
  }, [
    mode,
    hasSingleWritableChurch,
    defaultEditableChurchId,
    fetchMinistriesByChurch,
  ]);

  const handleCancel = () => {
    if (
      typeof window !== "undefined" &&
      shouldNavigateBack(isSelfEdit, window.history.length)
    ) {
      router.back();
      return;
    }

    router.push(isSelfEdit ? "/home" : "/members");
  };

  if (isFetching) {
    return (
      <div
        className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm">Carregando dados do membro...</p>
      </div>
    );
  }

  return (
    <FormTemplate size="wide">
      <FormTemplate.Form<CreateMemberInput> form={form} onSubmit={onSubmit}>
        <FormTemplate.Content className="space-y-4 pt-0">
          <FormTemplate.Section
            id="member-personal-data-heading"
            title="Dados pessoais"
            description="Informe os dados básicos para identificar e entrar em contato com esta pessoa."
          >
            <BasicInfoSection form={form} disabled={readOnly} />
          </FormTemplate.Section>

          <FormTemplate.Section
            id="member-churches-heading"
            title="Participação na igreja"
            description="Informe em quais igrejas a pessoa participa e quais atividades pode realizar."
          >
            <ChurchSection
              form={form}
              editableFields={editableFields}
              editableChurches={editableChurches}
              roles={roles}
              readonlyChurches={readonlyChurches}
              canChangeChurch={canChangeChurch}
              canEditSystemRole={canEditSystemRole}
              canEditMinistries={canEditMinistries}
              canEditMinistryRoles={canEditMinistryRoles}
              getMinistriesByChurch={getMinistriesByChurch}
              fetchMinistriesByChurch={fetchMinistriesByChurch}
              isLoadingMinistries={isLoadingMinistries}
              editableAppendMinistry={editableAppendMinistry}
              editableRemoveMinistry={editableRemoveMinistry}
              getMinistryRoleIds={getMinistryRoleIds}
              onToggleMinistryRole={onToggleMinistryRole}
              clearChurchMinistryAssignments={clearChurchMinistryAssignments}
              editableAppend={editableAppend}
              editableRemove={editableRemove}
              disabled={readOnly}
            />
          </FormTemplate.Section>

          <FormTemplate.Section
            id="member-availability-heading"
            title="Disponibilidade para as escalas"
            description="Informe em quais dias a pessoa pode ser incluída nas escalas."
          >
            <AvailabilitySection form={form} disabled={readOnly} />
          </FormTemplate.Section>
        </FormTemplate.Content>

        {!readOnly && (
          <FormTemplate.Footer
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel={isEdit ? "Salvar alterações" : "Cadastrar membro"}
          />
        )}
      </FormTemplate.Form>
    </FormTemplate>
  );
}
