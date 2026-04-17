"use client";

import { ChurchForm } from "@/features/churches/components/ChurchForm";
import { PrivateHeader } from "@/components/modules/private-header";

export default function NewChurchPage() {
  return (
    <>
      <PrivateHeader
        title="Nova Igreja"
        subtitle="Preencha os dados da igreja"
        backHref="/churches"
      />
      <div className="px-4 pb-4">
        <ChurchForm mode="create" />
      </div>
    </>
  );
}
