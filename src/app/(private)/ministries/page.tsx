"use client";

import { HeartHandshake, Inbox, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useMinistries } from "@/features/ministries/hooks/useMinistries";
import { Permission } from "@/shared/domain/enums/Permission";

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

  const canWrite =
    user?.isSuperAdmin || user?.permissions.includes(Permission.MINISTRY_WRITE);
  const canDelete =
    user?.isSuperAdmin ||
    user?.permissions.includes(Permission.MINISTRY_DELETE);
  const hasSelectedChurch = Boolean(user?.churchId);
  const showToolbar = allMinistriesCount > 0 || Boolean(searchQuery.trim());

  const handleCreate = useCallback(() => {
    router.push("/ministries/new");
  }, [router]);

  const handleEdit = useCallback(
    (ministryId: string) => router.push(`/ministries/${ministryId}/edit`),
    [router],
  );

  const handleDelete = useCallback(
    async (ministryId: string) => {
      const success = await deleteMinistry(ministryId);
      toast[success ? "success" : "error"](
        success
          ? "Ministério excluído com sucesso"
          : "Erro ao excluir ministério",
      );
    },
    [deleteMinistry],
  );

  const renderContent = () => {
    if (!hasSelectedChurch) {
      return (
        <ListTemplate.EmptyState
          icon={HeartHandshake}
          title="Selecione uma igreja"
          description="Escolha uma igreja para visualizar e organizar seus ministérios."
          action={{
            label: "Selecionar igreja",
            onClick: () => router.push("/select-church"),
          }}
        />
      );
    }

    if (ministries.length === 0 && allMinistriesCount === 0 && !isLoading) {
      return (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Cadastre o primeiro ministério"
          description="Organize as áreas de atuação da igreja e adicione suas funções quando quiser."
          action={
            canWrite
              ? { label: "Cadastrar ministério", onClick: handleCreate }
              : undefined
          }
        />
      );
    }

    if (ministries.length === 0 && searchQuery.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhum ministério encontrado"
          description={`Não encontramos ministérios para "${searchQuery}".`}
          action={{ label: "Limpar busca", onClick: () => setSearch("") }}
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
            description={`${ministry.roles.length} função${ministry.roles.length !== 1 ? "ões" : ""}`}
            onClick={canWrite ? () => handleEdit(ministry.id) : undefined}
            actions={
              canWrite || canDelete
                ? {
                    onEdit: canWrite
                      ? () => handleEdit(ministry.id)
                      : undefined,
                    onDelete: canDelete
                      ? () => handleDelete(ministry.id)
                      : undefined,
                  }
                : undefined
            }
          />
        ))}
      </ListTemplate.List>
    );
  };

  return (
    <ListTemplate isLoading={isLoading && hasSelectedChurch}>
      <ListTemplate.Header
        title="Ministérios"
        subtitle={
          hasSelectedChurch
            ? `${allMinistriesCount} ministério${allMinistriesCount !== 1 ? "s" : ""}`
            : "Organize as áreas de atuação da igreja"
        }
        bgColor="#16a34a"
      />

      {showToolbar && hasSelectedChurch && (
        <ListTemplate.Toolbar
          search={{
            value: searchQuery,
            onChange: setSearch,
            onClear: () => setSearch(""),
            placeholder: "Buscar um ministério",
            resultLabel: "ministério",
            resultsCount: ministries.length,
          }}
          action={
            canWrite
              ? {
                  label: "Cadastrar ministério",
                  icon: Plus,
                  onClick: handleCreate,
                }
              : undefined
          }
        />
      )}

      {renderContent()}
    </ListTemplate>
  );
}
