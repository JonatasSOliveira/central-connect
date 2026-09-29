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
          title="Vamos cadastrar sua primeira igreja?"
          description="Cadastre os dados básicos da igreja para começar a organizar o Central Connect."
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
          description={`Não encontramos uma igreja com o nome "${searchQuery}".`}
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
        <ListTemplate.SearchBar
          value={searchQuery}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Buscar uma igreja"
          resultsCount={churches.length}
        />
      )}

      {canWrite && hasChurches && (
        <ListTemplate.Action
          label="Nova igreja"
          icon={Plus}
          onClick={handleCreateChurch}
          buttonClassName="w-full sm:w-auto"
          className="mb-2 sm:mb-0"
        />
      )}

      {renderContent()}
    </ListTemplate>
  );
}
