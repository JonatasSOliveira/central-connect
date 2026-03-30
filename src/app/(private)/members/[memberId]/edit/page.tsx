"use client";

import { use } from "react";
import { MemberForm } from "@/features/members/components";
import { PrivateHeader } from "@/components/modules/private-header";

interface EditMemberPageProps {
  params: Promise<{ memberId: string }>;
}

export default function EditMemberPage({ params }: EditMemberPageProps) {
  const { memberId } = use(params);

  return (
    <>
      <PrivateHeader
        title="Editar Membro"
        subtitle="Altere os dados do membro"
        backHref="/members"
      />
      <div className="px-4 pb-4">
        <MemberForm mode="edit" memberId={memberId} />
      </div>
    </>
  );
}
