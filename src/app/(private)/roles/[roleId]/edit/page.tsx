"use client";

import { use } from "react";
import { RoleForm } from "@/features/roles/components/RoleForm";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

interface EditRolePageProps {
  params: Promise<{ roleId: string }>;
}

export default function EditRolePage({ params }: EditRolePageProps) {
  const { roleId } = use(params);

  usePermissions({
    requiredPermissions: [Permission.ROLE_WRITE],
    redirectTo: "/roles",
  });

  return (
    <>
      <PrivateHeader
        title="Editar Cargo do Sistema"
        subtitle="Altere os dados do cargo"
        backHref="/roles"
      />
      <div className="px-4 pb-4">
        <RoleForm mode="edit" roleId={roleId} />
      </div>
    </>
  );
}
