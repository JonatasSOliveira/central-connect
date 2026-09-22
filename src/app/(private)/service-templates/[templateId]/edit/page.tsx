"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { PrivateHeader } from "@/components/modules/private-header";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { ServiceTemplateForm } from "@/features/serviceTemplates/components/service-template-form";
import { Permission } from "@/shared/domain/enums/Permission";

interface EditServiceTemplatePageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export default function EditServiceTemplatePage({
  params,
}: EditServiceTemplatePageProps) {
  const router = useRouter();
  const { templateId } = use(params);

  usePermissions({
    requiredPermissions: [Permission.SERVICE_TEMPLATE_WRITE],
    redirectTo: "/home",
  });

  return (
    <>
      <PrivateHeader
        title="Editar Modelo"
        subtitle="Atualize os dados do modelo de culto"
        backHref="/service-templates"
      />
      <div className="px-4 pb-4">
        <ServiceTemplateForm
          mode="edit"
          templateId={templateId}
          goBack={() => router.push("/service-templates")}
        />
      </div>
    </>
  );
}
