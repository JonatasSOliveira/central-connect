"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { PrivateHeader } from "@/components/modules/private-header";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ServiceForm } from "@/features/services/components/service-form";
import { Permission } from "@/shared/domain/enums/Permission";

interface EditServicePageProps {
  params: Promise<{
    serviceId: string;
  }>;
}

export default function EditServicePage({ params }: EditServicePageProps) {
  const router = useRouter();
  const { serviceId } = use(params);

  usePermissions({
    requiredPermissions: [Permission.SERVICE_WRITE],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Editar Culto"
        subtitle="Atualize os dados do culto"
        backHref="/services"
      />
      <div className="px-4 pb-4">
        <ServiceForm
          mode="edit"
          serviceId={serviceId}
          goBack={() => router.push("/services")}
        />
      </div>
    </>
  );
}
