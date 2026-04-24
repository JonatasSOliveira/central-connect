"use client";

import { Inbox, ListChecks, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GenerateScaleDialog } from "./generate-scale-dialog";
import { ScaleFilter } from "./ScaleFilter";
import { ScaleItem } from "./ScaleItem";
import { useScales } from "../hooks/useScales";

interface ServiceOption {
  id: string;
  title: string;
  date: Date | string;
  time: string;
}

interface MinistryOption {
  id: string;
  name: string;
}

export function ScaleList() {
  const router = useRouter();
  const { user } = useAuth();
  const churchId = user?.churchId ?? null;

  const {
    scales,
    allScalesCount,
    isLoading,
    searchQuery,
    setSearch,
    filters,
    setFilters,
    deleteScale,
    refresh,
  } = useScales();

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [ministries, setMinistries] = useState<MinistryOption[]>([]);

  useEffect(() => {
    const fetchServicesAndMinistries = async () => {
      if (!churchId) return;

      try {
        const [servicesRes, ministriesRes] = await Promise.all([
          fetch(`/api/services?churchId=${churchId}`),
          fetch(`/api/ministries?churchId=${churchId}`),
        ]);

        const servicesData = await servicesRes.json();
        if (servicesData.ok) {
          setServices(
            servicesData.value.services.map(
              (s: {
                id: string;
                title: string;
                date: Date | string;
                time: string;
              }) => ({
                id: s.id,
                title: s.title,
                date: s.date,
                time: s.time,
              }),
            ),
          );
        }

        const ministriesData = await ministriesRes.json();
        if (ministriesData.ok) {
          setMinistries(
            ministriesData.value.ministries.map(
              (m: { id: string; name: string }) => ({
                id: m.id,
                name: m.name,
              }),
            ),
          );
        }
      } catch (error) {
        console.error("Error fetching services and ministries:", error);
      }
    };

    fetchServicesAndMinistries();
  }, [churchId]);

  const handleCreateScale = useCallback(() => {
    router.push("/scales/new");
  }, [router]);

  const handleEditScale = useCallback(
    (scaleId: string) => {
      router.push(`/scales/${scaleId}/edit`);
    },
    [router],
  );

  const handleDeleteScale = useCallback(
    async (scaleId: string) => {
      const success = await deleteScale(scaleId);
      if (success) {
        toast.success("Escala excluída com sucesso");
      } else {
        toast.error("Erro ao excluir escala");
      }
    },
    [deleteScale],
  );

  const getServiceTitle = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    return service?.title ?? "Culto não encontrado";
  };

  const getServiceDateTime = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return null;

    const date = new Date(service.date);
    const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" });
    const shortDate = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return `${dayName} ${shortDate} - ${service.time}`;
  };

  const getMinistryName = (ministryId: string) => {
    const ministry = ministries.find((m) => m.id === ministryId);
    return ministry?.name ?? "Ministério não encontrado";
  };

  const renderContent = () => {
    if (allScalesCount === 0 && !isLoading) {
      return (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhuma escala cadastrada"
          description="Clique em Nova escala para cadastrar a primeira escala da igreja."
          action={{
            label: "Cadastrar escala",
            onClick: handleCreateScale,
          }}
        />
      );
    }

    if (scales.length === 0 && filters.serviceId) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhuma escala para este culto"
          description="Tente ajustar os filtros"
          action={{
            label: "Limpar filtros",
            onClick: () => setFilters({}),
          }}
        />
      );
    }

    if (scales.length === 0 && filters.ministryId) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhuma escala para este ministério"
          description="Tente ajustar os filtros"
          action={{
            label: "Limpar filtros",
            onClick: () => setFilters({}),
          }}
        />
      );
    }

    if (scales.length === 0 && searchQuery.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhuma escala encontrada"
          description={`Não foram encontradas escalas para "${searchQuery}"`}
          action={{
            label: "Limpar busca",
            onClick: () => setSearch(""),
          }}
        />
      );
    }

    return (
      <ListTemplate.List>
        {scales.map((scale) => (
          <ScaleItem
            key={scale.id}
            icon={ListChecks}
            title={getMinistryName(scale.ministryId)}
            subtitle={getServiceDateTime(scale.serviceId) ?? undefined}
            tertiary={getServiceTitle(scale.serviceId)}
            status={scale.status}
            description={scale.notes ?? undefined}
            onClick={() => handleEditScale(scale.id)}
            actions={{
              onEdit: () => handleEditScale(scale.id),
              onDelete: () => handleDeleteScale(scale.id),
            }}
          />
        ))}
      </ListTemplate.List>
    );
  };

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Escalas"
        subtitle={`${allScalesCount} escala${allScalesCount !== 1 ? "s" : ""}`}
      />

      <div className="space-y-3 mb-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Buscar escalas..."
        />

        <ScaleFilter
          services={services}
          ministries={ministries}
          filters={filters}
          onApplyFilters={setFilters}
        />

        {searchQuery && scales.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {scales.length} resultado{scales.length !== 1 ? "s" : ""} para "
            {searchQuery}"
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <GenerateScaleDialog onSuccess={refresh} />
        <Button onClick={handleCreateScale}>
          <Plus className="w-4 h-4 mr-2" />
          Nova escala
        </Button>
      </div>

      {renderContent()}
    </ListTemplate>
  );
}
