"use client";

import { useParams } from "next/navigation";
import { PrivateHeader } from "@/components/modules/private-header";
import { ChurchForm } from "@/features/churches/components/ChurchForm";

export default function EditChurchPage() {
  const params = useParams<{ churchId: string }>();
  const churchId = params?.churchId;

  return (
    <>
      <PrivateHeader
        title="Editar Igreja"
        subtitle="Altere os dados da igreja"
        backHref="/home"
      />
      <div className="px-4 pb-4">
        <ChurchForm mode="edit" churchId={churchId} />
      </div>
    </>
  );
}
