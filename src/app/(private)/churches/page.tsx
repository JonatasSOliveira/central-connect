"use client";

import { Building2, Plus, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { ListTemplate } from "@/components/templates/list-template";
import { useChurches } from "@/features/churches/hooks/useChurches";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

export default function ChurchesPage() {
  const router = useRouter();
  const { churches, isLoading } = useChurches();

  usePermissions({
    requiredPermissions: [Permission.CHURCH_READ],
    redirectTo: "/home",
  });

  const handleCreateChurch = () => {
    router.push("/churches/new");
  };

  const handleEditChurch = (churchId: string) => {
    router.push(`/churches/${churchId}/edit`);
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
            />
          ))}
        </ListTemplate.List>
      )}
    </ListTemplate>
  );
}
