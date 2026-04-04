"use client";

import { useRouter } from "next/navigation";
import { ServiceTemplateForm } from "@/features/serviceTemplates/components/service-template-form";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

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
