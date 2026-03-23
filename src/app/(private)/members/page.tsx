"use client";

import { User, Plus, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { ListTemplate } from "@/components/templates/list-template";
import { useMembers } from "@/features/members/hooks/useMembers";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

export default function MembersPage() {
  const router = useRouter();
  const { members, isLoading } = useMembers();

  usePermissions({
    requiredPermissions: [Permission.MEMBER_READ],
    redirectTo: "/home",
  });

  const handleCreateMember = () => {
    router.push("/members/new");
  };

  const handleEditMember = (memberId: string) => {
    router.push(`/members/${memberId}/edit`);
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
              description={member.churchName ?? undefined}
              onClick={() => handleEditMember(member.id)}
            />
          ))}
        </ListTemplate.List>
      )}
    </ListTemplate>
  );
}
