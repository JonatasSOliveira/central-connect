"use client";

import { Building2, Plus, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useChurches } from "@/features/churches/hooks/useChurches";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function ChurchesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { churches, isLoading, deleteChurch } = useChurches();

  usePermissions({
    requiredPermissions: [Permission.CHURCH_READ],
    redirectTo: "/home",
  });

  const canDelete =
    user?.isSuperAdmin || user?.permissions.includes(Permission.CHURCH_DELETE);

  const handleCreateChurch = () => {
    router.push("/churches/new");
  };

  const handleEditChurch = (churchId: string) => {
    router.push(`/churches/${churchId}/edit`);
  };

  const handleDeleteChurch = async (churchId: string) => {
    const success = await deleteChurch(churchId);
    if (success) {
      toast.success("Igreja excluída com sucesso");
    } else {
      toast.error("Erro ao excluir igreja");
    }
  };

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Igrejas"
        subtitle="Gerencie as igrejas da plataforma"
      />

      <ListTemplate.Action
        label="Nova Igreja"
        icon={Plus}
        onClick={handleCreateChurch}
      />

      {churches.length === 0 ? (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhuma igreja cadastrada"
          description="Clique em Nova Igreja para cadastrar a primeira igreja da plataforma."
          action={{
            label: "Cadastrar Igreja",
            onClick: handleCreateChurch,
          }}
        />
      ) : (
        <ListTemplate.List>
          {churches.map((church) => (
            <ListTemplate.Item
              key={church.id}
              icon={Building2}
              title={church.name}
              onClick={() => handleEditChurch(church.id)}
              actions={
                canDelete
                  ? {
                      onEdit: () => handleEditChurch(church.id),
                      onDelete: () => handleDeleteChurch(church.id),
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
