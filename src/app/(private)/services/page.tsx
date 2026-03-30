"use client";

import { Cross, Plus, Inbox, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";
import { ListTemplate } from "@/components/templates/list-template";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useServices } from "@/features/services/hooks/useServices";

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    services,
    allServicesCount,
    isLoading,
    searchQuery,
    setSearch,
    deleteService,
  } = useServices();

  usePermissions({
    requiredPermissions: [Permission.SERVICE_READ],
    redirectTo: "/home",
  });

  const canWrite =
    user?.isSuperAdmin || user?.permissions.includes(Permission.SERVICE_WRITE);

  const handleCreateService = useCallback(() => {
    router.push("/services/new");
  }, [router]);

  const handleEditService = useCallback(
    (serviceId: string) => {
      router.push(`/services/${serviceId}/edit`);
    },
    [router],
  );

  const handleDeleteService = useCallback(
    async (serviceId: string) => {
      const success = await deleteService(serviceId);
      if (success) {
        toast.success("Culto excluído com sucesso");
      } else {
        toast.error("Erro ao excluir culto");
      }
    },
    [deleteService],
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const renderContent = () => {
    if (services.length === 0 && allServicesCount === 0 && !isLoading) {
      return (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhum culto cadastrado"
          description="Clique em Novo culto para cadastrar o primeiro culto da igreja."
          action={{
            label: "Cadastrar culto",
            onClick: handleCreateService,
          }}
        />
      );
    }

    if (services.length === 0 && searchQuery.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhum culto encontrado"
          description={`Não foram encontrados cultos para "${searchQuery}"`}
          action={{
            label: "Limpar busca",
            onClick: () => setSearch(""),
          }}
        />
      );
    }

    return (
      <ListTemplate.List>
        {services.map((service) => (
          <ListTemplate.Item
            key={service.id}
            icon={Cross}
            title={service.title}
            description={`${formatDate(service.date)} às ${formatTime(service.time)}${service.location ? ` • ${service.location}` : ""}${service.shift ? ` • ${service.shift}` : ""}`}
            onClick={canWrite ? () => handleEditService(service.id) : undefined}
            actions={{
              onEdit: canWrite ? () => handleEditService(service.id) : undefined,
              onDelete: () => handleDeleteService(service.id),
            }}
          />
        ))}
      </ListTemplate.List>
    );
  };

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Cultos"
        subtitle={`${allServicesCount} culto${allServicesCount !== 1 ? "s" : ""}`}
      />

      <div className="space-y-3 mb-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Buscar por título..."
        />
        {searchQuery && (
          <p className="text-xs text-muted-foreground">
            {services.length} resultado{services.length !== 1 ? "s" : ""} para "
            {searchQuery}"
          </p>
        )}
      </div>

      {canWrite && (
        <ListTemplate.Action
          label="Novo culto"
          icon={Plus}
          onClick={handleCreateService}
        />
      )}

      {renderContent()}
    </ListTemplate>
  );
}
