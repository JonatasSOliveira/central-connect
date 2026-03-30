"use client";

import { MemberForm } from "@/features/members/components";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

export default function NewMemberPage() {
  usePermissions({
    requiredPermissions: [Permission.MEMBER_WRITE],
    redirectTo: "/members",
  });

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
