"use client";

import { MinistryForm } from "@/features/ministries/components/MinistryForm";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

export default function NewMinistryPage() {
  usePermissions({
    requiredPermissions: [Permission.MINISTRY_WRITE],
    redirectTo: "/home",
  });

  return <MinistryForm mode="create" backHref="/ministries" />;
}
