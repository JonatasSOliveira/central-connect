"use client";

import { use } from "react";
import { MinistryForm } from "@/features/ministries/components/MinistryForm";
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
    <MinistryForm mode="edit" ministryId={ministryId} backHref="/ministries" />
  );
}
