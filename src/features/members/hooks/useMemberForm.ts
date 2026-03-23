"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ChurchListItemDTO } from "@/application/dtos/church/ChurchDTO";
import {
  type CreateMemberInput,
  CreateMemberInputSchema,
} from "@/application/dtos/member/CreateMemberDTO";
import type { RoleListItem } from "@/application/dtos/role/ListRolesDTO";
import { Permission } from "@/domain/enums/Permission";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UseMemberFormProps {
  mode: "create" | "edit";
  memberId?: string;
}

export interface EditableChurch {
  index: number;
  churchId: string;
  roleId: string;
}

export interface ReadonlyChurch {
  churchId: string;
  churchName: string;
  roleId: string;
  roleName: string;
}

export interface UseMemberFormReturn {
  form: ReturnType<typeof useForm<CreateMemberInput>>;
  editableFields: ReturnType<
    typeof useFieldArray<CreateMemberInput, "churches">
  >["fields"];
  editableAppend: ReturnType<
    typeof useFieldArray<CreateMemberInput, "churches">
  >["append"];
  editableRemove: ReturnType<
    typeof useFieldArray<CreateMemberInput, "churches">
  >["remove"];
  isLoading: boolean;
  isFetching: boolean;
  onSubmit: (data: CreateMemberInput) => Promise<void>;
  isEdit: boolean;
  roles: RoleListItem[];
  editableChurches: ChurchListItemDTO[];
  readonlyChurches: ReadonlyChurch[];
  canChangeChurch: boolean;
  isSelfEdit: boolean;
}

export function useMemberForm({
  mode,
  memberId,
}: UseMemberFormProps): UseMemberFormReturn {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [editableChurches, setEditableChurches] = useState<ChurchListItemDTO[]>(
    [],
  );
  const [readonlyChurches, setReadonlyChurches] = useState<ReadonlyChurch[]>(
    [],
  );

  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const hasMemberWrite =
    user?.permissions?.includes(Permission.MEMBER_WRITE) ?? false;
  const isSelfEdit =
    mode === "edit" &&
    memberId === user?.memberId &&
    user?.permissions?.includes(Permission.MEMBER_SELF_WRITE);

  const canChangeChurch = isSuperAdmin || hasMemberWrite;

  const userChurches = user?.churches ?? [];
  const userWritableChurchIds = useMemo(() => {
    if (isSuperAdmin) {
      return userChurches.map((c) => c.churchId);
    }
    return hasMemberWrite ? userChurches.map((c) => c.churchId) : [];
  }, [isSuperAdmin, hasMemberWrite, userChurches]);

  const hasSingleWritableChurch = userWritableChurchIds.length === 1;
  const defaultEditableChurchId = hasSingleWritableChurch
    ? userWritableChurchIds[0]
    : "";

  const form = useForm<CreateMemberInput>({
    resolver: zodResolver(CreateMemberInputSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      churches: [{ churchId: defaultEditableChurchId, roleId: "" }],
    },
    mode: "onBlur",
  });

  const {
    fields: editableFields,
    append: editableAppend,
    remove: editableRemove,
  } = useFieldArray({
    control: form.control,
    name: "churches",
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles");
        const data = await response.json();
        if (data.ok) {
          setRoles(data.value.roles);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchEditableChurches = async () => {
      if (!canChangeChurch) {
        return;
      }

      try {
        if (isSuperAdmin) {
          const response = await fetch("/api/churches");
          const data = await response.json();
          if (data.ok) {
            setEditableChurches(data.value.churches);
          }
        } else {
          const userChurchIds = userWritableChurchIds;
          const allChurchesResponse = await fetch("/api/churches");
          const allChurchesData = await allChurchesResponse.json();
          if (allChurchesData.ok) {
            const filteredChurches = allChurchesData.value.churches.filter(
              (church: ChurchListItemDTO) => userChurchIds.includes(church.id),
            );
            setEditableChurches(filteredChurches);
          }
        }
      } catch (error) {
        console.error("Error fetching editable churches:", error);
      }
    };

    fetchRoles();
    fetchEditableChurches();
  }, [canChangeChurch, isSuperAdmin, userWritableChurchIds]);

  useEffect(() => {
    if (mode === "edit" && memberId) {
      const fetchMember = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/members/${memberId}`);
          const data = await response.json();

          if (data.ok && data.value) {
            const memberData = data.value;

            const editable: { churchId: string; roleId: string }[] = [];
            const readonly: ReadonlyChurch[] = [];

            for (const church of memberData.churches) {
              if (church.userPermission === "write") {
                editable.push({
                  churchId: church.churchId,
                  roleId: church.roleId,
                });
              } else if (church.userPermission === "read") {
                readonly.push({
                  churchId: church.churchId,
                  churchName: church.churchName,
                  roleId: church.roleId,
                  roleName: church.roleName,
                });
              }
            }

            setReadonlyChurches(readonly);

            if (editable.length > 0) {
              form.reset({
                email: memberData.email,
                fullName: memberData.fullName,
                phone: memberData.phone ?? "",
                churches: editable,
              });
            } else if (hasSingleWritableChurch) {
              form.reset({
                email: memberData.email,
                fullName: memberData.fullName,
                phone: memberData.phone ?? "",
                churches: [{ churchId: defaultEditableChurchId, roleId: "" }],
              });
            } else {
              form.reset({
                email: memberData.email,
                fullName: memberData.fullName,
                phone: memberData.phone ?? "",
                churches: [{ churchId: "", roleId: "" }],
              });
            }
          } else {
            toast.error("Membro não encontrado");
            router.push("/members");
          }
        } catch {
          toast.error("Erro ao carregar dados do membro");
        } finally {
          setIsFetching(false);
        }
      };

      fetchMember();
    }
  }, [
    mode,
    memberId,
    form,
    router,
    defaultEditableChurchId,
    hasSingleWritableChurch,
  ]);

  const onSubmit = async (formData: CreateMemberInput) => {
    setIsLoading(true);

    try {
      if (mode === "create") {
        const response = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.ok) {
          toast.success("Membro criado com sucesso!");
          router.push("/members");
        } else {
          toast.error(data.error?.message || "Erro ao criar membro");
        }
      } else {
        if (!memberId) return;

        const response = await fetch(`/api/members/${memberId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.ok) {
          toast.success("Membro atualizado com sucesso!");
          router.push("/members");
        } else {
          toast.error(data.error?.message || "Erro ao atualizar membro");
        }
      }
    } catch {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  const wrappedSubmit = async (data: CreateMemberInput) => {
    await handleSubmit(data as unknown as Parameters<typeof handleSubmit>[0]);
  };

  return {
    form,
    editableFields,
    editableAppend,
    editableRemove,
    isLoading,
    isFetching,
    onSubmit: wrappedSubmit,
    isEdit: mode === "edit",
    roles,
    editableChurches,
    readonlyChurches,
    canChangeChurch,
    isSelfEdit: Boolean(isSelfEdit),
  };
}
