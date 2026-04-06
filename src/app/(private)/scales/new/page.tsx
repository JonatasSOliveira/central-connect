"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ScaleForm } from "@/features/scales/components/ScaleForm";

export default function NewScalePage() {
  usePermissions({
    requiredPermissions: [Permission.SCALE_WRITE],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Nova Escala"
        subtitle="Preencha os dados da escala"
        backHref="/scales"
      />
      <div className="px-4 pb-4">
        <ScaleForm mode="create" />
      </div>
    </>
  );
}
