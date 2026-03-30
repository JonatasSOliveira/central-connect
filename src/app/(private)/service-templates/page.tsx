"use client";

import { Settings2, Plus, Inbox, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";
import { ListTemplate } from "@/components/templates/list-template";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useServiceTemplates } from "@/features/serviceTemplates/hooks/useServiceTemplates";
import { GenerateWeekDialog } from "@/features/serviceTemplates/components/generate-week-dialog";

const dayOfWeekLabels: Record<string, string> = {
  Sunday: "Domingo",
  Monday: "Segunda",
  Tuesday: "Terça",
  Wednesday: "Quarta",
  Thursday: "Quinta",
  Friday: "Sexta",
  Saturday: "Sábado",
};

export default function ServiceTemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    templates,
    allTemplatesCount,
    isLoading,
    searchQuery,
    setSearch,
    deleteTemplate,
  } = useServiceTemplates();

  usePermissions({
    requiredPermissions: [Permission.SERVICE_TEMPLATE_READ],
    redirectTo: "/home",
  });

  const canWrite =
    user?.isSuperAdmin ||
    user?.permissions.includes(Permission.SERVICE_TEMPLATE_WRITE);

  const canGenerate =
    user?.isSuperAdmin ||
    user?.permissions.includes(Permission.SERVICE_TEMPLATE_GENERATE);

  const handleCreateTemplate = useCallback(() => {
    router.push("/service-templates/new");
  }, [router]);

  const handleEditTemplate = useCallback(
    (templateId: string) => {
      router.push(`/service-templates/${templateId}/edit`);
    },
    [router],
  );

  const handleDeleteTemplate = useCallback(
    async (templateId: string) => {
      const success = await deleteTemplate(templateId);
      if (success) {
        toast.success("Modelo excluído com sucesso");
      } else {
        toast.error("Erro ao excluir modelo");
      }
    },
    [deleteTemplate],
  );

  const renderContent = () => {
    if (templates.length === 0 && allTemplatesCount === 0 && !isLoading) {
      return (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhum modelo cadastrado"
          description="Clique em Novo modelo para cadastrar o primeiro modelo de culto."
          action={{
            label: "Cadastrar modelo",
            onClick: handleCreateTemplate,
          }}
        />
      );
    }

    if (templates.length === 0 && searchQuery.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhum modelo encontrado"
          description={`Não foram encontrados modelos para "${searchQuery}"`}
          action={{
            label: "Limpar busca",
            onClick: () => setSearch(""),
          }}
        />
      );
    }

    return (
      <ListTemplate.List>
        {templates.map((template) => (
          <ListTemplate.Item
            key={template.id}
            icon={Settings2}
            title={template.title}
            description={`${dayOfWeekLabels[template.dayOfWeek] || template.dayOfWeek} • ${template.shift} • ${template.time}${template.location ? ` • ${template.location}` : ""}${template.isActive ? "" : " • Inativo"}`}
            onClick={canWrite ? () => handleEditTemplate(template.id) : undefined}
            actions={{
              onEdit: canWrite
                ? () => handleEditTemplate(template.id)
                : undefined,
              onDelete: () => handleDeleteTemplate(template.id),
            }}
          />
        ))}
      </ListTemplate.List>
    );
  };

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Modelos de Culto"
        subtitle={`${allTemplatesCount} modelo${allTemplatesCount !== 1 ? "s" : ""}`}
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
            {templates.length} resultado
            {templates.length !== 1 ? "s" : ""} para "{searchQuery}"
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {canGenerate && <GenerateWeekDialog onSuccess={() => window.location.reload()} />}
        {canWrite && (
          <ListTemplate.Action
            label="Novo modelo"
            icon={Plus}
            onClick={handleCreateTemplate}
          />
        )}
      </div>

      {renderContent()}
    </ListTemplate>
  );
}
