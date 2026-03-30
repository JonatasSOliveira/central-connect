"use client";

import { use } from "react";
import { ChurchForm } from "@/features/churches/components/ChurchForm";
import { PrivateHeader } from "@/components/modules/private-header";

interface EditChurchPageProps {
  params: Promise<{ churchId: string }>;
}

export default function EditChurchPage({ params }: EditChurchPageProps) {
  const { churchId } = use(params);

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
