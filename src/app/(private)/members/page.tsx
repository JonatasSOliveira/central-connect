"use client";

import { User, Plus, Inbox, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";
import { ListTemplate } from "@/components/templates/list-template";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useMembersListScreen } from "@/features/members/hooks/useMembers";

export default function MembersPage() {
  const router = useRouter();

  const {
    members,
    allMembersCount,
    isLoading,
    searchQuery,
    setSearch,
    deleteMember,
  } = useMembersListScreen();

  usePermissions({
    requiredPermissions: [Permission.MEMBER_READ],
    redirectTo: "/home",
  });

  useEffect(() => {
    if (members.length === 0 && allMembersCount === 0 && !isLoading) {
      router.push("/select-church");
    }
  }, [members.length, allMembersCount, isLoading, router]);

  const handleCreateMember = useCallback(() => {
    router.push("/members/new");
  }, [router]);

  const handleEditMember = useCallback(
    (memberId: string) => {
      router.push(`/members/${memberId}/edit`);
    },
    [router],
  );

  const handleDeleteMember = useCallback(
    async (memberId: string) => {
      const success = await deleteMember(memberId);
      if (success) {
        toast.success("Membro excluído com sucesso");
      } else {
        toast.error("Erro ao excluir membro");
      }
    },
    [deleteMember],
  );

  const renderContent = () => {
    if (members.length === 0 && allMembersCount === 0 && !isLoading) {
      return (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhum membro cadastrado"
          description="Clique em Novo membro para cadastrar o primeiro membro da igreja."
          action={{
            label: "Cadastrar membro",
            onClick: handleCreateMember,
          }}
        />
      );
    }

    if (members.length === 0 && searchQuery.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhum membro encontrado"
          description={`Não foram encontrados membros para "${searchQuery}"`}
          action={{
            label: "Limpar busca",
            onClick: () => setSearch(""),
          }}
        />
      );
    }

    return (
      <ListTemplate.List>
        {members.map((member) => (
          <ListTemplate.Item
            key={member.id}
            icon={User}
            title={member.fullName}
            description={member.churches.map((c) => c.churchName).join(", ")}
            onClick={() => handleEditMember(member.id)}
            actions={{
              onEdit: () => handleEditMember(member.id),
              onDelete: () => handleDeleteMember(member.id),
            }}
          />
        ))}
      </ListTemplate.List>
    );
  };

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Membros"
        subtitle={`${allMembersCount} membro${allMembersCount !== 1 ? "s" : ""}`}
      />

      <div className="space-y-3 mb-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Buscar por nome..."
        />
        {searchQuery && (
          <p className="text-xs text-muted-foreground">
            {members.length} resultado{members.length !== 1 ? "s" : ""} para "
            {searchQuery}"
          </p>
        )}
      </div>

      <ListTemplate.Action
        label="Novo membro"
        icon={Plus}
        onClick={handleCreateMember}
      />

      {renderContent()}
    </ListTemplate>
  );
}
