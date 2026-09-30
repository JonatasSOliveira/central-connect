"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
    <FormTemplate>
      <FormTemplate.Form<CreateMemberInput> form={form} onSubmit={onSubmit}>
        <FormTemplate.Content className="space-y-4 pt-0">
          <FormTemplate.Section
            id="member-personal-data-heading"
            title="Dados pessoais"
            description="Campos com * são obrigatórios. Informe como podemos identificar o membro."
          >
            <BasicInfoSection form={form} disabled={readOnly} />
          </FormTemplate.Section>

          <FormTemplate.Section
            id="member-churches-heading"
            title="Igrejas e atuação"
            description="Associe o membro às igrejas, ao cargo e aos ministérios em que atua."
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
          </FormTemplate.Section>

          <FormTemplate.Section
            id="member-availability-heading"
            title="Disponibilidade para as escalas"
            description="Defina em quais dias essa pessoa pode participar."
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
