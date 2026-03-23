"use client";

import { RoleForm } from "@/features/roles/components/RoleForm";

export default function NewRolePage() {
  return <RoleForm mode="create" backHref="/roles" />;
}
