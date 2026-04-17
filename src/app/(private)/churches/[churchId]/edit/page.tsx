"use client";

import { useSearchParams } from "next/navigation";
import { PrivateHeader } from "@/components/modules/private-header";
import { ChurchForm } from "@/features/churches/components/ChurchForm";

export default function EditChurchPage() {
  const searchParams = useSearchParams();
  const params = searchParams.get("churchId") as string | null;
  const churchId = params ?? undefined;
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
