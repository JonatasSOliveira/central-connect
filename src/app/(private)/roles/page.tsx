"use client";

import { Inbox, Plus, Search, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { Permission } from "@/shared/domain/enums/Permission";

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

  const canWrite = user?.isSuperAdmin ?? false;
  const canDelete = user?.isSuperAdmin ?? false;
  const showToolbar = allRolesCount > 0 || Boolean(searchQuery.trim());

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
        toast.success("Cargo excluído com sucesso");
      } else {
        toast.error("Erro ao excluir cargo");
      }
    },
    [deleteRole],
  );

  const renderContent = () => {
    if (roles.length === 0 && allRolesCount === 0 && !isLoading) {
      return (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhum cargo cadastrado"
          description="Crie um cargo para definir quais áreas do sistema cada pessoa poderá acessar."
          action={
            canWrite
              ? { label: "Cadastrar cargo", onClick: handleCreateRole }
              : undefined
          }
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
            onClick={canWrite ? () => handleEditRole(role.id) : undefined}
            actions={
              canWrite || canDelete
                ? {
                    onEdit: canWrite
                      ? () => handleEditRole(role.id)
                      : undefined,
                    onDelete: canDelete
                      ? () => handleDeleteRole(role.id)
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
        title="Cargos e permissões"
        subtitle={`${allRolesCount} cargo${allRolesCount !== 1 ? "s" : ""}`}
        bgColor="#16a34a"
      />

      {showToolbar && (
        <ListTemplate.Toolbar
          search={{
            value: searchQuery,
            onChange: setSearch,
            onClear: () => setSearch(""),
            placeholder: "Buscar um cargo",
            resultLabel: "cargo",
            resultsCount: roles.length,
          }}
          action={
            canWrite
              ? {
                  label: "Cadastrar cargo",
                  icon: Plus,
                  onClick: handleCreateRole,
                }
              : undefined
          }
        />
      )}

      {renderContent()}
    </ListTemplate>
  );
}
