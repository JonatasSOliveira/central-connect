"use client";

import { use } from "react";
import { RoleForm } from "@/features/roles/components/RoleForm";

interface EditRolePageProps {
  params: Promise<{ roleId: string }>;
}

export default function EditRolePage({ params }: EditRolePageProps) {
  const { roleId } = use(params);

  return <RoleForm mode="edit" roleId={roleId} backHref="/roles" />;
}
