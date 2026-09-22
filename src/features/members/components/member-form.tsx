"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormTemplate } from "@/components/templates/form-template";
import { FormSection } from "@/components/ui/form-section";
import { useMemberForm } from "@/features/members/hooks/useMemberForm";
import { shouldNavigateBack } from "@/features/members/utils/selfEditNavigation";
import type { CreateMemberInput } from "@/modules/members/application/dtos/member/CreateMemberDTO";
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
    editableAppendMinistry,
    editableRemoveMinistry,
    getMinistriesByChurch,
    fetchMinistriesByChurch,
    isLoadingMinistries,
  } = useMemberForm({
    mode,
    memberId,
    isSelfEdit,
  });

  const [_addingMinistryTo, setAddingMinistryTo] = useState<number | null>(
    null,
  );
  const [selectedMinistryId, setSelectedMinistryId] = useState("");

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

  const _handleAddMinistry = (churchIndex: number) => {
    if (selectedMinistryId) {
      editableAppendMinistry(churchIndex, selectedMinistryId);
      setSelectedMinistryId("");
      setAddingMinistryTo(null);
    }
  };

  const handleCancel = () => {
    if (
      typeof window !== "undefined" &&
      shouldNavigateBack(isSelfEdit, window.history.length)
    ) {
      router.back();
      return;
    }

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
      <FormTemplate.Form<CreateMemberInput> form={form} onSubmit={onSubmit}>
        <FormTemplate.Content>
          <FormSection
            title="Dados pessoais"
            description="Informações usadas para identificar o membro."
          >
            <BasicInfoSection form={form} disabled={readOnly} />
          </FormSection>

          <FormSection
            title="Disponibilidade"
            description="Defina os dias em que esta pessoa pode servir."
          >
            <AvailabilitySection form={form} disabled={readOnly} />
          </FormSection>

          <FormSection
            title="Vínculos e ministérios"
            description="Defina a igreja, o cargo e as áreas em que o membro atua."
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
              getMinistriesByChurch={getMinistriesByChurch}
              fetchMinistriesByChurch={fetchMinistriesByChurch}
              isLoadingMinistries={isLoadingMinistries}
              editableAppendMinistry={editableAppendMinistry}
              editableRemoveMinistry={editableRemoveMinistry}
              editableAppend={editableAppend}
              editableRemove={editableRemove}
              disabled={readOnly}
            />
          </FormSection>
        </FormTemplate.Content>

        {!readOnly && (
          <FormTemplate.Footer
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel={isEdit ? "Salvar" : "Criar"}
          />
        )}
      </FormTemplate.Form>
    </FormTemplate>
  );
}
