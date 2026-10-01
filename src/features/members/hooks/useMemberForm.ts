"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { shouldNavigateBack } from "@/features/members/utils/selfEditNavigation";
import type { ChurchListItemDTO } from "@/modules/churches/presentation/contracts/church/ChurchDTO";
import {
  type CreateMemberInput,
  CreateMemberInputSchema,
} from "@/modules/members/presentation/contracts/member/CreateMemberDTO";
import type { MinistryListItemDTO } from "@/modules/ministries/presentation/contracts/ministry/MinistryDTO";
import type { RoleListItem } from "@/modules/roles/presentation/contracts/role/ListRolesDTO";
import { Permission } from "@/shared/domain/enums/Permission";
import { normalizePhone } from "@/shared/utils/phone";
import { ALL_DAYS_OF_WEEK } from "@/shared/constants/daysOfWeek";
import { useChurchCatalogStore } from "@/stores/churchCatalogStore";
import { useRoleCatalogStore } from "@/stores/roleCatalogStore";

interface UseMemberFormProps {
  mode: "create" | "edit";
  memberId?: string;
  isSelfEdit?: boolean;
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
  ministryIds: string[];
}

type MinistryRoleAssignment = NonNullable<
  CreateMemberInput["ministryRoleAssignments"]
>[number];

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
  canEditSystemRole: boolean;
  canEditMinistries: boolean;
  canEditMinistryRoles: boolean;
  editableAppendMinistry: (churchIndex: number, ministryId: string) => void;
  editableRemoveMinistry: (churchIndex: number, ministryIndex: number) => void;
  getMinistryRoleIds: (churchId: string, ministryId: string) => string[];
  onToggleMinistryRole: (
    churchId: string,
    ministryId: string,
    roleId: string,
  ) => void;
  clearChurchMinistryAssignments: (churchId: string) => void;
  getMinistriesByChurch: (churchId: string) => MinistryListItemDTO[];
  fetchMinistriesByChurch: (churchId: string) => Promise<void>;
  isLoadingMinistries: boolean;
}

export function useMemberForm({
  mode,
  memberId,
  isSelfEdit = false,
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
  const [ministriesMap, setMinistriesMap] = useState<
    Map<string, MinistryListItemDTO[]>
  >(new Map());
  const [isLoadingMinistries, setIsLoadingMinistries] = useState(false);
  const { churches: cachedChurches, fetchIfStale: fetchChurchesCatalog } =
    useChurchCatalogStore();
  const { roles: cachedRoles, fetchIfStale: fetchRolesCatalog } =
    useRoleCatalogStore();

  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const hasMemberWrite =
    user?.permissions?.includes(Permission.MEMBER_WRITE) ?? false;
  const hasMemberSelfWrite =
    user?.permissions?.includes(Permission.MEMBER_SELF_WRITE) ?? false;

  const canEditSystemRole = isSuperAdmin || hasMemberWrite;
  const canChangeChurch = canEditSystemRole;
  const canEditOwnMinistries =
    isSelfEdit && memberId === user?.memberId && hasMemberSelfWrite;
  const canEditMinistries = canEditSystemRole || canEditOwnMinistries;
  const canEditMinistryRoles = canEditSystemRole;

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
      availability: {
        daysOfWeek: [...ALL_DAYS_OF_WEEK],
      },
      churches: [
        {
          churchId: defaultEditableChurchId,
          roleId: "",
          ministryIds: [],
        },
      ],
      ministryRoleAssignments: [],
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

  const fetchMinistriesByChurch = useCallback(
    async (churchId: string) => {
      if (!churchId || ministriesMap.has(churchId)) {
        return;
      }

      setIsLoadingMinistries(true);
      try {
        const response = await fetch(`/api/ministries?churchId=${churchId}`);
        const data = await response.json();
        if (data.ok) {
          setMinistriesMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(churchId, data.value.ministries);
            return newMap;
          });
        }
      } catch (error) {
        console.error("Error fetching ministries:", error);
      } finally {
        setIsLoadingMinistries(false);
      }
    },
    [ministriesMap],
  );

  const getMinistriesByChurch = useCallback(
    (churchId: string): MinistryListItemDTO[] => {
      return ministriesMap.get(churchId) || [];
    },
    [ministriesMap],
  );

  const editableAppendMinistry = useCallback(
    (churchIndex: number, ministryId: string) => {
      const currentIds =
        form.getValues(`churches.${churchIndex}.ministryIds`) || [];
      if (!currentIds.includes(ministryId)) {
        form.setValue(`churches.${churchIndex}.ministryIds`, [
          ...currentIds,
          ministryId,
        ]);
      }
    },
    [form],
  );

  const editableRemoveMinistry = useCallback(
    (churchIndex: number, ministryIndex: number) => {
      const currentIds =
        form.getValues(`churches.${churchIndex}.ministryIds`) || [];
      const ministryId = currentIds[ministryIndex];
      form.setValue(
        `churches.${churchIndex}.ministryIds`,
        currentIds.filter((_, idx) => idx !== ministryIndex),
      );
      if (ministryId) {
        const assignments = form.getValues("ministryRoleAssignments") || [];
        form.setValue(
          "ministryRoleAssignments",
          assignments.filter(
            (assignment) =>
              assignment.churchId !==
                form.getValues(`churches.${churchIndex}.churchId`) ||
              assignment.ministryId !== ministryId,
          ),
          { shouldDirty: true },
        );
      }
    },
    [form],
  );

  const getMinistryRoleIds = useCallback(
    (churchId: string, ministryId: string) =>
      form
        .getValues("ministryRoleAssignments")
        ?.find(
          (assignment) =>
            assignment.churchId === churchId &&
            assignment.ministryId === ministryId,
        )?.ministryRoleIds ?? [],
    [form],
  );

  const onToggleMinistryRole = useCallback(
    (churchId: string, ministryId: string, roleId: string) => {
      const assignments = form.getValues("ministryRoleAssignments") || [];
      const existing = assignments.find(
        (assignment) =>
          assignment.churchId === churchId &&
          assignment.ministryId === ministryId,
      );
      const selectedRoleIds = existing?.ministryRoleIds ?? [];
      const ministryRoleIds = selectedRoleIds.includes(roleId)
        ? selectedRoleIds.filter((id) => id !== roleId)
        : [...selectedRoleIds, roleId];
      const nextAssignments = assignments.filter(
        (assignment) =>
          assignment.churchId !== churchId ||
          assignment.ministryId !== ministryId,
      );
      nextAssignments.push({ churchId, ministryId, ministryRoleIds });
      form.setValue("ministryRoleAssignments", nextAssignments, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  const clearChurchMinistryAssignments = useCallback(
    (churchId: string) => {
      const assignments = form.getValues("ministryRoleAssignments") || [];
      form.setValue(
        "ministryRoleAssignments",
        assignments.filter((assignment) => assignment.churchId !== churchId),
        { shouldDirty: true },
      );
    },
    [form],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchRoles = useCallback(async () => {
    try {
      if (cachedRoles.length > 0) {
        setRoles(cachedRoles);
      }

      const loadedRoles = await fetchRolesCatalog();
      if (loadedRoles.length > 0) {
        setRoles(loadedRoles);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }, [cachedRoles, fetchRolesCatalog]);

  const fetchEditableChurches = useCallback(async () => {
    if (!canChangeChurch) {
      return;
    }

    try {
      if (cachedChurches.length > 0) {
        const cachedFilteredChurches = cachedChurches.filter((church) =>
          userWritableChurchIds.includes(church.id),
        );
        setEditableChurches(cachedFilteredChurches);
      }

      const loadedChurches = await fetchChurchesCatalog();
      if (loadedChurches.length > 0) {
        const filteredChurches = isSuperAdmin
          ? loadedChurches
          : loadedChurches.filter((church) =>
              userWritableChurchIds.includes(church.id),
            );
        setEditableChurches(filteredChurches);
        return;
      }

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
  }, [
    cachedChurches,
    canChangeChurch,
    fetchChurchesCatalog,
    isSuperAdmin,
    userWritableChurchIds,
  ]);

  useEffect(() => {
    fetchRoles();
    fetchEditableChurches();
  }, [fetchRoles, fetchEditableChurches]);

  useEffect(() => {
    if (mode === "edit" && memberId) {
      const fetchMember = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/members/${memberId}`);
          const data = await response.json();

          if (data.ok && data.value) {
            const memberData = data.value;

            const editable: {
              churchId: string;
              roleId: string;
              ministryIds: string[];
            }[] = [];
            const readonly: ReadonlyChurch[] = [];
            const ministryRoleAssignments: MinistryRoleAssignment[] = [];

            for (const church of memberData.churches) {
              if (church.userPermission === "write" || canEditOwnMinistries) {
                editable.push({
                  churchId: church.churchId,
                  roleId: church.roleId,
                  ministryIds: church.ministryIds || [],
                });
                for (const item of church.ministryRoleIdsByMinistry ?? []) {
                  ministryRoleAssignments.push({
                    churchId: church.churchId,
                    ministryId: item.ministryId,
                    ministryRoleIds: item.ministryRoleIds,
                  });
                }
                fetchMinistriesByChurch(church.churchId);
              } else if (church.userPermission === "read") {
                readonly.push({
                  churchId: church.churchId,
                  churchName: church.churchName,
                  roleId: church.roleId,
                  roleName: church.roleName,
                  ministryIds: church.ministryIds || [],
                });
              }
            }

            setReadonlyChurches(readonly);

            if (!canChangeChurch && canEditMinistries) {
              setEditableChurches(
                memberData.churches.map(
                  (church: {
                    churchId: string;
                    churchName: string;
                    roleId: string;
                  }) => ({
                    id: church.churchId,
                    name: church.churchName,
                    selfSignupDefaultRoleId: church.roleId || null,
                  }),
                ),
              );
            }

            if (editable.length > 0) {
              form.reset({
                email: memberData.email,
                fullName: memberData.fullName,
                phone: normalizePhone(memberData.phone),
                availability: memberData.availability ?? {
                  daysOfWeek: [...ALL_DAYS_OF_WEEK],
                },
                churches: editable,
                ministryRoleAssignments,
              });
            } else if (hasSingleWritableChurch) {
              form.reset({
                email: memberData.email,
                fullName: memberData.fullName,
                phone: normalizePhone(memberData.phone),
                availability: memberData.availability ?? {
                  daysOfWeek: [...ALL_DAYS_OF_WEEK],
                },
                churches: [
                  {
                    churchId: defaultEditableChurchId,
                    roleId: "",
                    ministryIds: [],
                  },
                ],
                ministryRoleAssignments: [],
              });
              fetchMinistriesByChurch(defaultEditableChurchId);
            } else {
              form.reset({
                email: memberData.email,
                fullName: memberData.fullName,
                phone: normalizePhone(memberData.phone),
                availability: memberData.availability ?? {
                  daysOfWeek: [...ALL_DAYS_OF_WEEK],
                },
                churches: [{ churchId: "", roleId: "", ministryIds: [] }],
                ministryRoleAssignments: [],
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
    fetchMinistriesByChurch,
    canChangeChurch,
    canEditMinistries,
    canEditOwnMinistries,
  ]);

  const onSubmit = async (formData: CreateMemberInput) => {
    setIsLoading(true);

    const normalizedPhone = normalizePhone(formData.phone);
    const normalizedCreatePayload: CreateMemberInput = {
      ...formData,
      phone: normalizedPhone || undefined,
      availability: formData.availability,
    };

    try {
      if (mode === "create") {
        const response = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalizedCreatePayload),
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

        const payload: Record<string, unknown> = {
          fullName: formData.fullName,
          phone: normalizedPhone || undefined,
          availability: formData.availability,
        };

        if (formData.email !== undefined) {
          payload.email = formData.email || undefined;
        }

        if (canChangeChurch) {
          payload.churches = formData.churches;
        } else if (canEditMinistries) {
          payload.ministryAssignments = formData.churches
            .filter((church) => church.churchId)
            .map((church) => ({
              churchId: church.churchId,
              ministryIds: church.ministryIds,
            }));
        }

        if (canEditMinistryRoles) {
          payload.ministryRoleAssignments =
            formData.ministryRoleAssignments ?? [];
        }

        const response = await fetch(`/api/members/${memberId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.ok) {
          toast.success("Membro atualizado com sucesso!");
          if (
            typeof window !== "undefined" &&
            shouldNavigateBack(isSelfEdit, window.history.length)
          ) {
            router.back();
          } else if (isSelfEdit) {
            router.push("/home");
          } else {
            router.push("/members");
          }
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

  return {
    form,
    editableFields,
    editableAppend,
    editableRemove,
    isLoading,
    isFetching,
    onSubmit,
    isEdit: mode === "edit",
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
  };
}
