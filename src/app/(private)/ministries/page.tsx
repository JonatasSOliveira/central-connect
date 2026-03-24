"use client";

import { Plus, Inbox, HeartHandshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useMinistries } from "@/features/ministries/hooks/useMinistries";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function MinistriesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { ministries, isLoading, deleteMinistry } = useMinistries();

  usePermissions({
    requiredPermissions: [Permission.MINISTRY_READ],
    redirectTo: "/home",
  });

  const canDelete =
    user?.isSuperAdmin ||
    user?.permissions.includes(Permission.MINISTRY_DELETE);

  const handleCreateMinistry = () => {
    router.push("/ministries/new");
  };

  const handleEditMinistry = (ministryId: string) => {
    router.push(`/ministries/${ministryId}/edit`);
  };

  const handleDeleteMinistry = async (ministryId: string) => {
    const success = await deleteMinistry(ministryId);
    if (success) {
      toast.success("Ministério excluído com sucesso");
    } else {
      toast.error("Erro ao excluir ministério");
    }
  };

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Ministérios"
        subtitle="Gerencie os ministérios da igreja"
      />

      <ListTemplate.Action
        label="Novo ministério"
        icon={Plus}
        onClick={handleCreateMinistry}
      />

      {ministries.length === 0 ? (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhum ministério cadastrado"
          description="Clique em Novo ministério para cadastrar o primeiro ministério."
          action={{
            label: "Cadastrar ministério",
            onClick: handleCreateMinistry,
          }}
        />
      ) : (
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
      )}
    </ListTemplate>
  );
}
