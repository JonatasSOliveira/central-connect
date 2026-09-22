"use client";

import { use } from "react";
import { PrivateHeader } from "@/components/modules/private-header";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { MinistryForm } from "@/features/ministries/components/MinistryForm";
import { Permission } from "@/shared/domain/enums/Permission";

interface EditMinistryPageProps {
  params: Promise<{ ministryId: string }>;
}

export default function EditMinistryPage({ params }: EditMinistryPageProps) {
  const { ministryId } = use(params);

  usePermissions({
    requiredPermissions: [Permission.MINISTRY_WRITE],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Editar Ministério"
        subtitle="Altere os dados do ministério"
        backHref="/ministries"
      />
      <div className="px-4 pb-4">
        <MinistryForm mode="edit" ministryId={ministryId} />
      </div>
    </>
  );
}
