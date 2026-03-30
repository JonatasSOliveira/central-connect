"use client";

import { RoleForm } from "@/features/roles/components/RoleForm";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

export default function NewRolePage() {
  usePermissions({
    requiredPermissions: [Permission.ROLE_WRITE],
    redirectTo: "/roles",
  });

  return (
    <>
      <PrivateHeader
        title="Novo Cargo do Sistema"
        subtitle="Preencha os dados do cargo"
        backHref="/roles"
      />
      <div className="px-4 pb-4">
        <RoleForm mode="create" />
      </div>
    </>
  );
}
