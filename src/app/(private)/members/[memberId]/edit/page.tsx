"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { MemberForm } from "@/features/members/components";
import { PrivateHeader } from "@/components/modules/private-header";

interface EditMemberPageProps {
  params: Promise<{ memberId: string }>;
}

export default function EditMemberPage({ params }: EditMemberPageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const memberId = resolvedParams.memberId;
  const readOnly = searchParams.get("readOnly") === "true";

  return (
    <>
      <PrivateHeader
        title={readOnly ? "Meu Perfil" : "Editar Membro"}
        subtitle={
          readOnly ? "Visualize seus dados" : "Altere os dados do membro"
        }
        backHref="/home"
      />
      <div className="px-4 pb-4">
        <MemberForm mode="edit" memberId={memberId} readOnly={readOnly} />
      </div>
    </>
  );
}
