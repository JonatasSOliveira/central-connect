"use client";

import { MemberForm } from "@/features/members/components/MemberForm";

export default function NewMemberPage() {
  return <MemberForm mode="create" backHref="/members" />;
}
