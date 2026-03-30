"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ServiceTemplateForm } from "@/features/serviceTemplates/components/service-template-form";
import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

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
