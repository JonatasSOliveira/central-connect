"use client";

import { Plus, Inbox, Shield, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RolesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    roles,
    allRolesCount,
    isLoading,
    searchQuery,
    setSearch,
    deleteRole,
  } = useRoles();

  usePermissions({
    requiredPermissions: [Permission.ROLE_READ],
    redirectTo: "/home",
  });

  const canWrite =
    user?.isSuperAdmin || user?.permissions.includes(Permission.ROLE_WRITE);
  const canDelete =
    user?.isSuperAdmin || user?.permissions.includes(Permission.ROLE_DELETE);

  const handleCreateRole = useCallback(() => {
    router.push("/roles/new");
  }, [router]);

  const handleEditRole = useCallback(
    (roleId: string) => {
      router.push(`/roles/${roleId}/edit`);
    },
    [router],
  );

  const handleDeleteRole = useCallback(
    async (roleId: string) => {
      const success = await deleteRole(roleId);
      if (success) {
        toast.success("Cargo do sistema excluído com sucesso");
      } else {
        toast.error("Erro ao excluir cargo do sistema");
      }
    },
    [deleteRole],
  );

  const renderContent = () => {
    if (roles.length === 0 && allRolesCount === 0 && !isLoading) {
      return (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhum cargo do sistema cadastrado"
          description="Clique em Novo cargo do sistema para cadastrar o primeiro cargo do sistema."
          action={{
            label: "Cadastrar cargo do sistema",
            onClick: handleCreateRole,
          }}
        />
      );
    }

    if (roles.length === 0 && searchQuery.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhum cargo encontrado"
          description={`Não foram encontrados cargos para "${searchQuery}"`}
          action={{
            label: "Limpar busca",
            onClick: () => setSearch(""),
          }}
        />
      );
    }

    return (
      <ListTemplate.List>
        {roles.map((role) => (
          <ListTemplate.Item
            key={role.id}
            icon={Shield}
            title={role.name}
            onClick={() => handleEditRole(role.id)}
            actions={
              canWrite || canDelete
                ? {
                    onEdit: canWrite ? () => handleEditRole(role.id) : undefined,
                    onDelete: canDelete ? () => handleDeleteRole(role.id) : undefined,
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
        title="Cargos"
        subtitle={`${allRolesCount} cargo${allRolesCount !== 1 ? "s" : ""}`}
      />

      <ListTemplate.SearchBar
        value={searchQuery}
        onChange={setSearch}
        onClear={() => setSearch("")}
        placeholder="Buscar por nome..."
        resultsCount={roles.length}
      />

      {canWrite && (
        <ListTemplate.Action
          label="Novo cargo do sistema"
          icon={Plus}
          onClick={handleCreateRole}
        />
      )}

      {renderContent()}
    </ListTemplate>
  );
}
