"use client";

import { User, Plus, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useMembers } from "@/features/members/hooks/useMembers";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function MembersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { members, isLoading, deleteMember } = useMembers();

  usePermissions({
    requiredPermissions: [Permission.MEMBER_READ],
    redirectTo: "/home",
  });

  const canDelete =
    user?.isSuperAdmin || user?.permissions.includes(Permission.MEMBER_DELETE);

  const handleCreateMember = () => {
    router.push("/members/new");
  };

  const handleEditMember = (memberId: string) => {
    router.push(`/members/${memberId}/edit`);
  };

  const handleDeleteMember = async (memberId: string) => {
    const success = await deleteMember(memberId);
    if (success) {
      toast.success("Membro excluído com sucesso");
    } else {
      toast.error("Erro ao excluir membro");
    }
  };

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Membros"
        subtitle="Gerencie os membros da igreja"
      />

      <ListTemplate.Action
        label="Novo membro"
        icon={Plus}
        onClick={handleCreateMember}
      />

      {members.length === 0 ? (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhum membro cadastrado"
          description="Clique em Novo membro para cadastrar o primeiro membro da igreja."
          action={{
            label: "Cadastrar membro",
            onClick: handleCreateMember,
          }}
        />
      ) : (
        <ListTemplate.List>
          {members.map((member) => (
            <ListTemplate.Item
              key={member.id}
              icon={User}
              title={member.fullName}
              description={member.churches.map((c) => c.churchName).join(", ")}
              onClick={() => handleEditMember(member.id)}
              actions={
                canDelete
                  ? {
                      onEdit: () => handleEditMember(member.id),
                      onDelete: () => handleDeleteMember(member.id),
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
