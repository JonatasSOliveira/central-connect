"use client";

import { useRouter } from "next/navigation";
import { PrivateHeader } from "@/components/modules/private-header";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ServiceForm } from "@/features/services/components/service-form";
import { Permission } from "@/shared/domain/enums/Permission";

export default function NewServicePage() {
  const router = useRouter();

  usePermissions({
    requiredPermissions: [Permission.SERVICE_WRITE],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Novo Culto"
        subtitle="Preencha os dados do culto"
        backHref="/services"
      />
      <div className="px-4 pb-4">
        <ServiceForm mode="create" goBack={() => router.push("/services")} />
      </div>
    </>
  );
}
