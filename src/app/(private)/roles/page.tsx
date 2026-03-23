"use client";

import { Plus, Inbox, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RolesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { roles, isLoading, deleteRole } = useRoles();

  usePermissions({
    requiredPermissions: [Permission.ROLE_READ],
    redirectTo: "/home",
  });

  const canDelete =
    user?.isSuperAdmin || user?.permissions.includes(Permission.ROLE_DELETE);

  const handleCreateRole = () => {
    router.push("/roles/new");
  };

  const handleEditRole = (roleId: string) => {
    router.push(`/roles/${roleId}/edit`);
  };

  const handleDeleteRole = async (roleId: string) => {
    const success = await deleteRole(roleId);
    if (success) {
      toast.success("Cargo excluído com sucesso");
    } else {
      toast.error("Erro ao excluir cargo");
    }
  };

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Cargos"
        subtitle="Gerencie as permissões dos cargos do sistema"
      />

      <ListTemplate.Action
        label="Novo cargo"
        icon={Plus}
        onClick={handleCreateRole}
      />

      {roles.length === 0 ? (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhum cargo cadastrado"
          description="Clique em Novo cargo para cadastrar o primeiro cargo do sistema."
          action={{
            label: "Cadastrar cargo",
            onClick: handleCreateRole,
          }}
        />
      ) : (
        <ListTemplate.List>
          {roles.map((role) => (
            <ListTemplate.Item
              key={role.id}
              icon={Shield}
              title={role.name}
              onClick={() => handleEditRole(role.id)}
              actions={
                canDelete
                  ? {
                      onEdit: () => handleEditRole(role.id),
                      onDelete: () => handleDeleteRole(role.id),
                    }
                  : undefined
              }
            />
          ))}
        </ListTemplate.List>
      )}
    </ListTemplate>
  );
}
