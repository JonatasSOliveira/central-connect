"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type {
  ScaleDetailDTO,
  ScaleFormInput,
} from "@/application/dtos/scale/ScaleDTO";
import { ScaleFormSchema } from "@/application/dtos/scale/ScaleDTO";
import { useAuthStore } from "@/stores/authStore";

interface ServiceOption {
  id: string;
  title: string;
  date: string;
}

interface MinistryOption {
  id: string;
  name: string;
}

interface MemberOption {
  id: string;
  fullName: string;
}

interface MinistryRoleOption {
  id: string;
  name: string;
}

interface UseScaleFormProps {
  mode: "create" | "edit";
  scaleId?: string;
}

export interface UseScaleFormReturn {
  form: ReturnType<typeof useForm<ScaleFormInput>>;
  editableFields: ReturnType<
    typeof useFieldArray<ScaleFormInput, "members">
  >["fields"];
  editableAppend: ReturnType<
    typeof useFieldArray<ScaleFormInput, "members">
  >["append"];
  editableRemove: ReturnType<
    typeof useFieldArray<ScaleFormInput, "members">
  >["remove"];
  isLoading: boolean;
  isFetching: boolean;
  onSubmit: (data: ScaleFormInput) => Promise<void>;
  services: ServiceOption[];
  ministries: MinistryOption[];
  availableMembers: MemberOption[];
  availableRoles: MinistryRoleOption[];
  isLoadingMembers: boolean;
  isLoadingRoles: boolean;
}

export function useScaleForm({
  mode,
  scaleId,
}: UseScaleFormProps): UseScaleFormReturn {
  const router = useRouter();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [ministries, setMinistries] = useState<MinistryOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [roles, setRoles] = useState<MinistryRoleOption[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const form = useForm<ScaleFormInput>({
    resolver: zodResolver(ScaleFormSchema),
    defaultValues: {
      serviceId: "",
      ministryId: "",
      status: "draft",
      notes: "",
      members: [],
    },
    mode: "onBlur",
  });

  const watchMinistryId = form.watch("ministryId");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  useEffect(() => {
    const fetchServices = async () => {
      if (!user?.churchId) return;

      try {
        const response = await fetch(`/api/services?churchId=${user.churchId}`);
        const data = await response.json();
        if (data.ok) {
          const servicesData = data.value.services.map(
            (s: { id: string; title: string; date: string }) => ({
              id: s.id,
              title: s.title,
              date: s.date,
            }),
          );
          setServices(servicesData);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [user?.churchId]);

  useEffect(() => {
    const fetchMinistries = async () => {
      if (!user?.churchId) return;

      try {
        const response = await fetch(
          `/api/ministries?churchId=${user.churchId}`,
        );
        const data = await response.json();
        if (data.ok) {
          const ministriesData = data.value.ministries.map(
            (m: { id: string; name: string }) => ({
              id: m.id,
              name: m.name,
            }),
          );
          setMinistries(ministriesData);
        }
      } catch (error) {
        console.error("Error fetching ministries:", error);
      }
    };

    fetchMinistries();
  }, [user?.churchId]);

  useEffect(() => {
    const fetchMembersAndRoles = async () => {
      if (!watchMinistryId || !user?.churchId) {
        setMembers([]);
        setRoles([]);
        return;
      }

      setIsLoadingMembers(true);
      setIsLoadingRoles(true);

      try {
        const [membersResponse, ministryResponse] = await Promise.all([
          fetch(
            `/api/members?churchId=${user.churchId}&ministryId=${watchMinistryId}`,
          ),
          fetch(`/api/ministries/${watchMinistryId}`),
        ]);

        const membersData = await membersResponse.json();
        if (membersData.ok) {
          const membersDataList = membersData.value.members.map(
            (m: { id: string; fullName: string }) => ({
              id: m.id,
              fullName: m.fullName,
            }),
          );
          setMembers(membersDataList);
        }

        const ministryData = await ministryResponse.json();
        if (ministryData.ok) {
          const rolesData = ministryData.value.ministry.roles.map(
            (r: { id: string; name: string }) => ({
              id: r.id,
              name: r.name,
            }),
          );
          setRoles(rolesData);
        }
      } catch (error) {
        console.error("Error fetching members and roles:", error);
      } finally {
        setIsLoadingMembers(false);
        setIsLoadingRoles(false);
      }
    };

    fetchMembersAndRoles();
  }, [watchMinistryId, user?.churchId]);

  const availableMembers = useMemo(() => {
    return members;
  }, [members]);

  const availableRoles = useMemo(() => {
    return roles;
  }, [roles]);

  useEffect(() => {
    if (mode === "edit" && scaleId) {
      const fetchScale = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/scales/${scaleId}`);
          const data = await response.json();

          if (data.ok && data.value) {
            const scaleData: ScaleDetailDTO = data.value.scale;
            form.reset({
              serviceId: scaleData.serviceId,
              ministryId: scaleData.ministryId,
              status: scaleData.status,
              notes: scaleData.notes ?? "",
              members: scaleData.members.map((m) => ({
                id: m.id,
                memberId: m.memberId,
                ministryRoleId: m.ministryRoleId,
                notes: m.notes ?? "",
              })),
            });
          } else {
            toast.error("Escala não encontrada");
            router.push("/scales");
          }
        } catch {
          toast.error("Erro ao carregar dados da escala");
        } finally {
          setIsFetching(false);
        }
      };

      fetchScale();
    }
  }, [mode, scaleId, form, router]);

  const onSubmit = useCallback(
    async (formData: ScaleFormInput) => {
      setIsLoading(true);

      try {
        if (mode === "create") {
          const url = `/api/scales?churchId=${user?.churchId}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (data.ok) {
            toast.success("Escala criada com sucesso!");
            router.push("/scales");
          } else {
            toast.error(data.error?.message || "Erro ao criar escala");
          }
        } else {
          if (!scaleId) return;

          const response = await fetch(`/api/scales/${scaleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (data.ok) {
            toast.success("Escala atualizada com sucesso!");
            router.push("/scales");
          } else {
            toast.error(data.error?.message || "Erro ao atualizar escala");
          }
        }
      } catch {
        toast.error("Ocorreu um erro. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    },
    [mode, scaleId, router, user?.churchId],
  );

  return {
    form,
    editableFields: fields,
    editableAppend: append,
    editableRemove: remove,
    isLoading,
    isFetching,
    onSubmit,
    services,
    ministries,
    availableMembers,
    availableRoles,
    isLoadingMembers,
    isLoadingRoles,
  };
}
