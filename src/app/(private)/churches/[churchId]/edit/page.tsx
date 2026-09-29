"use client";

import { useSearchParams } from "next/navigation";
import { use } from "react";
import { PrivateHeader } from "@/components/modules/private-header";
import { ChurchForm } from "@/features/churches/components/ChurchForm";

interface EditChurchPageProps {
  params: Promise<{ churchId: string }>;
}

export default function EditChurchPage({ params }: EditChurchPageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const churchId = resolvedParams.churchId;
  const readOnly = searchParams.get("readOnly") === "true";

  return (
    <>
      <PrivateHeader
        title={readOnly ? "Dados da igreja" : "Editar Igreja"}
        subtitle={
          readOnly
            ? "Visualize as informações cadastradas"
            : "Atualize os dados e as configurações da igreja"
        }
        backHref="/churches"
        bgColor="#16a34a"
      />
      <div className="px-4 pb-4">
        <ChurchForm mode="edit" churchId={churchId} readOnly={readOnly} />
      </div>
    </>
  );
}
