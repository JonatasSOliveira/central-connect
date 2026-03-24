"use client";

import { ChurchForm } from "@/features/churches/components/ChurchForm";

export default function NewChurchPage() {
  return <ChurchForm mode="create" backHref="/churches" />;
}
