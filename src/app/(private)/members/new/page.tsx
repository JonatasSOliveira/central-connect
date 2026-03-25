"use client";

import { MemberForm } from "@/features/members/components/MemberForm";
import { PrivateHeader } from "@/components/modules/private-header";

export default function NewMemberPage() {
  return (
    <>
      <PrivateHeader
        title="Novo Membro"
        subtitle="Preencha os dados do membro"
        backHref="/members"
      />
      <div className="px-4 pb-4">
        <MemberForm mode="create" />
      </div>
    </>
  );
}
