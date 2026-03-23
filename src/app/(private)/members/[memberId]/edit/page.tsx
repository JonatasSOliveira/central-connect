"use client";

import { use } from "react";
import { MemberForm } from "@/features/members/components/MemberForm";

interface EditMemberPageProps {
  params: Promise<{ memberId: string }>;
}

export default function EditMemberPage({ params }: EditMemberPageProps) {
  const { memberId } = use(params);

  return <MemberForm mode="edit" memberId={memberId} backHref="/members" />;
}
