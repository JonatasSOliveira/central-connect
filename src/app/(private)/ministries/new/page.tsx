"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { MinistryForm } from "@/features/ministries/components/MinistryForm";
import { Permission } from "@/shared/domain/enums/Permission";

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
