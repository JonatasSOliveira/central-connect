"use client";

import { User, Plus, Inbox, Search, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
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
    isLoading,
    isLoadingMore,
    hasMore,
    total,
    search,
    setSearch,
    loadMore,
    refresh,
    deleteMember,
    localSearch,
    setLocalSearch,
    churchId,
  } = useMembersListScreen();

  usePermissions({
    requiredPermissions: [Permission.MEMBER_READ],
    redirectTo: "/home",
  });

  useEffect(() => {
    if (churchId === null && !isLoading) {
      router.push("/select-church");
    }
  }, [churchId, isLoading, router]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, isLoadingMore, loadMore]);

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
    if (members.length === 0 && !isLoading) {
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

    if (members.length === 0 && localSearch.trim()) {
      return (
        <ListTemplate.EmptyState
          icon={Search}
          title="Nenhum membro encontrado"
          description={`Não foram encontrados membros para "${localSearch}"`}
          action={{
            label: "Limpar busca",
            onClick: () => {
              setLocalSearch("");
              setSearch("");
            },
          }}
        />
      );
    }

    return (
      <>
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
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isLoadingMore && (
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          )}
          {!hasMore && members.length > 0 && (
            <p className="text-xs text-muted-foreground">Fim da lista</p>
          )}
        </div>
      </>
    );
  };

  return (
    <ListTemplate isLoading={isLoading}>
      <ListTemplate.Header
        title="Membros"
        subtitle={`${total} membro${total !== 1 ? "s" : ""}`}
      />

      <div className="space-y-3 mb-4">
        <SearchInput
          value={localSearch}
          onChange={setLocalSearch}
          onClear={() => setSearch("")}
          placeholder="Buscar por nome..."
        />
        {localSearch && (
          <p className="text-xs text-muted-foreground">
            {total} resultado{total !== 1 ? "s" : ""} para "{localSearch}"
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
