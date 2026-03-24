"use client";

import { use } from "react";
import { ChurchForm } from "@/features/churches/components/ChurchForm";

interface EditChurchPageProps {
  params: Promise<{ churchId: string }>;
}

export default function EditChurchPage({ params }: EditChurchPageProps) {
  const { churchId } = use(params);

  return <ChurchForm mode="edit" churchId={churchId} backHref="/churches" />;
}
