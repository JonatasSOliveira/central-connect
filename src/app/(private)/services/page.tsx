"use client";

import { Cross, Plus, Inbox, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
    filters,
    setSearch,
    applyFilters,
    deleteService,
  } = useServices();

  const [showFilters, setShowFilters] = useState(false);
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");

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

  const handleApplyFilters = useCallback(() => {
    applyFilters(
      localStartDate ? new Date(localStartDate) : undefined,
      localEndDate ? new Date(localEndDate) : undefined,
    );
    setShowFilters(false);
  }, [localStartDate, localEndDate, applyFilters]);

  const handleClearFilters = useCallback(() => {
    setLocalStartDate("");
    setLocalEndDate("");
    applyFilters(undefined, undefined);
  }, [applyFilters]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const renderContent = () => {
    const hasFilters = filters.startDate || filters.endDate;

    if (allServicesCount === 0 && !isLoading) {
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

    if (services.length === 0 && hasFilters) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhum culto no período"
          description="Tente ajustar as datas dos filtros"
          action={{
            label: "Limpar filtros",
            onClick: handleClearFilters,
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
            description={`${formatDate(service.date)} às ${service.time}${service.location ? ` • ${service.location}` : ""}${service.shift ? ` • ${service.shift}` : ""}`}
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

  const hasActiveFilters = filters.startDate || filters.endDate;

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
        
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showFilters ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
              ativo
            </span>
          )}
        </button>

        {showFilters && (
          <div className="space-y-3 pt-2 pb-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 min-w-0">
                <label className="text-xs text-muted-foreground">De</label>
                <input
                  type="date"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs text-muted-foreground">Até</label>
                <input
                  type="date"
                  value={localEndDate}
                  onChange={(e) => setLocalEndDate(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={handleApplyFilters}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Filter className="w-4 h-4 mr-1" />
                Aplicar
              </Button>
              
              {(localStartDate || localEndDate || hasActiveFilters) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        )}

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