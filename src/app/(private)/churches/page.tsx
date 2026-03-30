"use client";

import { Church, Plus, Inbox, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useChurches } from "@/features/churches/hooks/useChurches";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function ChurchesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    churches,
    allChurchesCount,
    isLoading,
    searchQuery,
    setSearch,
    deleteChurch,
  } = useChurches();

  usePermissions({
    requiredPermissions: [Permission.CHURCH_READ],
    redirectTo: "/home",
  });

  const canWrite =
    user?.isSuperAdmin || user?.permissions.includes(Permission.CHURCH_WRITE);
  const canDelete =
    user?.isSuperAdmin || user?.permissions.includes(Permission.CHURCH_DELETE);

  const handleCreateChurch = useCallback(() => {
    router.push("/churches/new");
  }, [router]);

  const handleEditChurch = useCallback(
    (churchId: string) => {
      router.push(`/churches/${churchId}/edit`);
    },
    [router],
  );

  const handleDeleteChurch = useCallback(
    async (churchId: string) => {
      const success = await deleteChurch(churchId);
      if (success) {
        toast.success("Igreja excluída com sucesso");
      } else {
        toast.error("Erro ao excluir igreja");
      }
    },
    [deleteChurch],
  );

  const renderContent = () => {
    if (churches.length === 0 && allChurchesCount === 0 && !isLoading) {
      return (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhuma igreja cadastrada"
          description="Clique em Nova Igreja para cadastrar a primeira igreja da plataforma."
          action={{
            label: "Cadastrar Igreja",
            onClick: handleCreateChurch,
          }}
        />
      );
    }

    if (churches.length === 0 && searchQuery.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhuma igreja encontrada"
          description={`Não foram encontradas igrejas para "${searchQuery}"`}
          action={{
            label: "Limpar busca",
            onClick: () => setSearch(""),
          }}
        />
      );
    }

    return (
      <ListTemplate.List>
        {churches.map((church) => (
          <ListTemplate.Item
            key={church.id}
            icon={Church}
            title={church.name}
            onClick={() => handleEditChurch(church.id)}
            actions={
              canWrite || canDelete
                ? {
                    onEdit: canWrite ? () => handleEditChurch(church.id) : undefined,
                    onDelete: canDelete
                      ? () => handleDeleteChurch(church.id)
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
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Igrejas"
        subtitle={`${allChurchesCount} igreja${allChurchesCount !== 1 ? "s" : ""}`}
      />

      <ListTemplate.SearchBar
        value={searchQuery}
        onChange={setSearch}
        onClear={() => setSearch("")}
        placeholder="Buscar por nome..."
        resultsCount={churches.length}
      />

      {canWrite && (
        <ListTemplate.Action
          label="Nova Igreja"
          icon={Plus}
          onClick={handleCreateChurch}
        />
      )}

      {renderContent()}
    </ListTemplate>
  );
}
