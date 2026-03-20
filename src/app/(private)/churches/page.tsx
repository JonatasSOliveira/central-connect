"use client";

import { useRouter } from "next/navigation";
import { Building2, Plus, Inbox } from "lucide-react";
import { ListTemplate } from "@/components/templates/list-template";
import { useChurches } from "@/features/churches/hooks/useChurches";

export default function ChurchesPage() {
  const router = useRouter();
  const { churches } = useChurches();

  const handleCreateChurch = () => {
    router.push("/churches/form");
  };

  const handleEditChurch = (churchId: string) => {
    router.push(`/churches/${churchId}/edit`);
  };

  return (
    <ListTemplate>
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
