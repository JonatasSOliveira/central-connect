"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { RoleForm } from "@/features/roles/components/RoleForm";

export default function NewRolePage() {
  return (
    <>
      <PrivateHeader
        title="Novo cargo"
        subtitle="Defina os acessos deste cargo"
        backHref="/roles"
        bgColor="#16a34a"
      />
      <div className="px-4 pb-4">
        <RoleForm mode="create" />
      </div>
    </>
  );
}
