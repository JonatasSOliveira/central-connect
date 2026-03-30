"use client";

import { Plus, Inbox, HeartHandshake, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useMinistries } from "@/features/ministries/hooks/useMinistries";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function MinistriesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    ministries,
    allMinistriesCount,
    isLoading,
    searchQuery,
    setSearch,
    deleteMinistry,
  } = useMinistries();

  usePermissions({
    requiredPermissions: [Permission.MINISTRY_READ],
    redirectTo: "/home",
  });

  const canDelete =
    user?.isSuperAdmin ||
    user?.permissions.includes(Permission.MINISTRY_DELETE);

  const handleCreateMinistry = useCallback(() => {
    router.push("/ministries/new");
  }, [router]);

  const handleEditMinistry = useCallback(
    (ministryId: string) => {
      router.push(`/ministries/${ministryId}/edit`);
    },
    [router],
  );

  const handleDeleteMinistry = useCallback(
    async (ministryId: string) => {
      const success = await deleteMinistry(ministryId);
      if (success) {
        toast.success("Ministério excluído com sucesso");
      } else {
        toast.error("Erro ao excluir ministério");
      }
    },
    [deleteMinistry],
  );

  const renderContent = () => {
    if (ministries.length === 0 && allMinistriesCount === 0 && !isLoading) {
      return (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhum ministry cadastrado"
          description="Clique em Novo ministry para cadastrar o primeiro ministry."
          action={{
            label: "Cadastrar ministry",
            onClick: handleCreateMinistry,
          }}
        />
      );
    }

    if (ministries.length === 0 && searchQuery.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhum ministry encontrado"
          description={`Não foram encontrados ministerios para "${searchQuery}"`}
          action={{
            label: "Limpar busca",
            onClick: () => setSearch(""),
          }}
        />
      );
    }

    return (
      <ListTemplate.List>
        {ministries.map((ministry) => (
          <ListTemplate.Item
            key={ministry.id}
            icon={HeartHandshake}
            title={ministry.name}
            description={`${ministry.roles.length} função(ões)`}
            onClick={() => handleEditMinistry(ministry.id)}
            actions={
              canDelete
                ? {
                    onEdit: () => handleEditMinistry(ministry.id),
                    onDelete: () => handleDeleteMinistry(ministry.id),
                  }
                : undefined
            }
          />
        ))}
      </ListTemplate.List>
    );
  };

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Ministérios"
        subtitle={`${allMinistriesCount} ministry${allMinistriesCount !== 1 ? "s" : ""}`}
      />

      <ListTemplate.SearchBar
        value={searchQuery}
        onChange={setSearch}
        onClear={() => setSearch("")}
        placeholder="Buscar por nome..."
        resultsCount={ministries.length}
      />

      <ListTemplate.Action
        label="Novo ministry"
        icon={Plus}
        onClick={handleCreateMinistry}
      />

      {renderContent()}
    </ListTemplate>
  );
}
