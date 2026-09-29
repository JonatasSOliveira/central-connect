"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { ChurchForm } from "@/features/churches/components/ChurchForm";

export default function NewChurchPage() {
  return (
    <>
      <PrivateHeader
        title="Nova Igreja"
        subtitle="Cadastre os dados básicos da igreja"
        backHref="/churches"
        bgColor="#16a34a"
      />
      <div className="px-4 pb-4">
        <ChurchForm mode="create" />
      </div>
    </>
  );
}
