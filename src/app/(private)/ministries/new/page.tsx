"use client";

import { MinistryForm } from "@/features/ministries/components/MinistryForm";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

export default function NewMinistryPage() {
  usePermissions({
    requiredPermissions: [Permission.MINISTRY_WRITE],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Novo Ministério"
        subtitle="Preencha os dados do ministério"
        backHref="/ministries"
      />
      <div className="px-4 pb-4">
        <MinistryForm mode="create" />
      </div>
    </>
  );
}
