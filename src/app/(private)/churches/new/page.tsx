"use client";

import { ChurchForm } from "@/features/churches/components/ChurchForm";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

export default function NewChurchPage() {
  usePermissions({
    requiredPermissions: [Permission.CHURCH_WRITE],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Nova Igreja"
        subtitle="Preencha os dados da igreja"
        backHref="/home"
      />
      <div className="px-4 pb-4">
        <ChurchForm mode="create" />
      </div>
    </>
  );
}
