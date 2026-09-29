"use client";

import { Church, Inbox, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useChurches } from "@/features/churches/hooks/useChurches";
import { Permission } from "@/shared/domain/enums/Permission";

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
  const hasChurches = allChurchesCount > 0;

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
          title="Cadastre sua primeira igreja"
          description="Adicione os dados básicos para começar a organizar suas igrejas no Central Connect."
          action={{
            label: "Cadastrar primeira igreja",
            onClick: handleCreateChurch,
            buttonClassName: "w-full sm:w-auto",
          }}
          className="mx-auto mt-8 max-w-xl border-primary/20 bg-card"
        />
      );
    }

    if (churches.length === 0 && searchQuery.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhuma igreja encontrada"
          description="Tente buscar por outro nome ou limpe o filtro para ver todas as igrejas."
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
            onClick={canWrite ? () => handleEditChurch(church.id) : undefined}
            className="border-primary/20"
            actions={
              canWrite || canDelete
                ? {
                    onEdit: canWrite
                      ? () => handleEditChurch(church.id)
                      : undefined,
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
        subtitle={
          hasChurches
            ? `${allChurchesCount} igreja${allChurchesCount !== 1 ? "s" : ""} cadastrada${allChurchesCount !== 1 ? "s" : ""}`
            : "Organize as igrejas cadastradas"
        }
        bgColor="#16a34a"
      />

      {hasChurches && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <ListTemplate.SearchBar
              value={searchQuery}
              onChange={setSearch}
              onClear={() => setSearch("")}
              placeholder="Buscar uma igreja"
              resultsCount={churches.length}
              className="mb-0"
            />
          </div>
          {canWrite && (
            <ListTemplate.Action
              label="Cadastrar igreja"
              icon={Plus}
              onClick={handleCreateChurch}
              buttonClassName="w-full sm:w-auto"
              className="w-full shrink-0 sm:w-auto"
            />
          )}
        </div>
      )}

      {renderContent()}
    </ListTemplate>
  );
}
