"use client";

import { Inbox, Plus, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { ListTemplate } from "@/components/templates/list-template";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useMembersListScreen } from "@/features/members/hooks/useMembers";
import { Permission } from "@/shared/domain/enums/Permission";

export default function MembersPage() {
  const router = useRouter();
  const { user } = useAuth();

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

  const canWrite =
    user?.isSuperAdmin || user?.permissions.includes(Permission.MEMBER_WRITE);
  const canDelete =
    user?.isSuperAdmin || user?.permissions.includes(Permission.MEMBER_DELETE);
  const hasMembers = allMembersCount > 0;
  const showToolbar = hasMembers || Boolean(searchQuery.trim());

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
          description="Cadastre o primeiro membro da igreja para começar a organizar sua comunidade."
          action={{
            label: "Cadastrar primeiro membro",
            onClick: handleCreateMember,
            buttonClassName: "w-full sm:w-auto",
          }}
          className="mx-auto mt-8 max-w-xl border-primary/20 bg-card"
        />
      );
    }

    if (members.length === 0 && searchQuery.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhum membro encontrado"
          description="Tente buscar por outro nome ou limpe o filtro para ver todos os membros."
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
            className="border-primary/20"
            onClick={canWrite ? () => handleEditMember(member.id) : undefined}
            actions={
              canWrite || canDelete
                ? {
                    onEdit: canWrite
                      ? () => handleEditMember(member.id)
                      : undefined,
                    onDelete: canDelete
                      ? () => handleDeleteMember(member.id)
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
        title="Membros"
        subtitle={
          hasMembers
            ? `${allMembersCount} membro${allMembersCount !== 1 ? "s" : ""} cadastrado${allMembersCount !== 1 ? "s" : ""}`
            : "Organize os membros cadastrados"
        }
        bgColor="#16a34a"
      />

      {showToolbar && (
        <ListTemplate.Toolbar
          search={{
            value: searchQuery,
            onChange: setSearch,
            onClear: () => setSearch(""),
            placeholder: "Buscar um membro",
            resultLabel: "membro",
            resultsCount: members.length,
          }}
          action={
            canWrite
              ? {
                  label: "Cadastrar membro",
                  icon: Plus,
                  onClick: handleCreateMember,
                }
              : undefined
          }
        />
      )}

      {renderContent()}
    </ListTemplate>
  );
}
