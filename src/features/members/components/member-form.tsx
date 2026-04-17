"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CreateMemberInput } from "@/application/dtos/member/CreateMemberDTO";
import { FormTemplate } from "@/components/templates/form-template";
import { useMemberForm } from "@/features/members/hooks/useMemberForm";
import { BasicInfoSection } from "./basic-info-section";
import { ChurchSection } from "./church-section";

interface MemberFormProps {
  mode: "create" | "edit";
  memberId?: string;
  readOnly?: boolean;
}

export function MemberForm({
  mode,
  memberId,
  readOnly = false,
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
    editableAppendMinistry,
    editableRemoveMinistry,
    getMinistriesByChurch,
    fetchMinistriesByChurch,
    isLoadingMinistries,
  } = useMemberForm({
    mode,
    memberId,
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
          <BasicInfoSection form={form} disabled={readOnly} />

          <ChurchSection
            form={form}
            editableFields={editableFields}
            editableChurches={editableChurches}
            roles={roles}
            readonlyChurches={readonlyChurches}
            canChangeChurch={canChangeChurch}
            getMinistriesByChurch={getMinistriesByChurch}
            fetchMinistriesByChurch={fetchMinistriesByChurch}
            isLoadingMinistries={isLoadingMinistries}
            editableAppendMinistry={editableAppendMinistry}
            editableRemoveMinistry={editableRemoveMinistry}
            editableAppend={editableAppend}
            editableRemove={editableRemove}
            disabled={readOnly}
          />
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
