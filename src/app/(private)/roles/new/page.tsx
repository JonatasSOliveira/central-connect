"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { RoleForm } from "@/features/roles/components/RoleForm";

export default function NewRolePage() {
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
