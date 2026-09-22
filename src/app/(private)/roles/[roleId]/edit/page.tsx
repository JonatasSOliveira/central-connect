"use client";

import { use } from "react";
import { PrivateHeader } from "@/components/modules/private-header";
import { RoleForm } from "@/features/roles/components/RoleForm";

interface EditRolePageProps {
  params: Promise<{ roleId: string }>;
}

export default function EditRolePage({ params }: EditRolePageProps) {
  const { roleId } = use(params);

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
