"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
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
            ? "Visualize os dados da igreja"
            : "Altere os dados da igreja"
        }
        backHref="/home"
      />
      <div className="px-4 pb-4">
        <ChurchForm mode="edit" churchId={churchId} readOnly={readOnly} />
      </div>
    </>
  );
}
