"use client";

import { use } from "react";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ScaleForm } from "@/features/scales/components/ScaleForm";

interface EditScalePageProps {
  params: Promise<{ scaleId: string }>;
}

export default function EditScalePage({ params }: EditScalePageProps) {
  const { scaleId } = use(params);

  usePermissions({
    requiredPermissions: [Permission.SCALE_WRITE],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Editar Escala"
        subtitle="Altere os dados da escala"
        backHref="/scales"
      />
      <div className="px-4 pb-4">
        <ScaleForm mode="edit" scaleId={scaleId} />
      </div>
    </>
  );
}
