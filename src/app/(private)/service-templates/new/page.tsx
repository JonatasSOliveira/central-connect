"use client";

import { useRouter } from "next/navigation";
import { PrivateHeader } from "@/components/modules/private-header";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ServiceTemplateForm } from "@/features/serviceTemplates/components/service-template-form";
import { Permission } from "@/shared/domain/enums/Permission";

export default function NewServiceTemplatePage() {
  const router = useRouter();

  usePermissions({
    requiredPermissions: [Permission.SERVICE_TEMPLATE_WRITE],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Novo Modelo"
        subtitle="Preencha os dados do modelo de culto"
        backHref="/service-templates"
      />
      <div className="px-4 pb-4">
        <ServiceTemplateForm
          mode="create"
          goBack={() => router.push("/service-templates")}
        />
      </div>
    </>
  );
}
