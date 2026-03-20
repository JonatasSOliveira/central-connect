"use client";

import { Building2, Plus, Inbox } from "lucide-react";
import { ListTemplate } from "@/components/templates/list-template";
import { useChurches } from "@/features/churches/hooks/useChurches";

export default function ChurchesPage() {
  const { churches } = useChurches();

  return (
    <ListTemplate>
      <ListTemplate.Header
        title="Igrejas"
        subtitle="Gerencie as igrejas da plataforma"
      />

      <ListTemplate.Action
        label="Nova Igreja"
        icon={Plus}
        disabled
      />

      {churches.length === 0 ? (
        <ListTemplate.EmptyState
          icon={Inbox}
          title="Nenhuma igreja cadastrada"
          description="Clique em Nova Igreja para cadastrar a primeira igreja da plataforma."
        />
      ) : (
        <ListTemplate.List>
          {churches.map((church) => (
            <ListTemplate.Item
              key={church.id}
              icon={Building2}
              title={church.name}
            />
          ))}
        </ListTemplate.List>
      )}
    </ListTemplate>
  );
}
