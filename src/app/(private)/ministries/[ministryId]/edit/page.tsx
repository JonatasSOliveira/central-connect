"use client";

import { use } from "react";
import { MinistryForm } from "@/features/ministries/components/MinistryForm";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

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
