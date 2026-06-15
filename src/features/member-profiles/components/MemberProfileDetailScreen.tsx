"use client";

import { PrivateHeader } from "@/components/modules/private-header";
import { Permission } from "@/domain/enums/Permission";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useMemberProfileDetail } from "@/features/member-profiles/hooks/useMemberProfileDetail";
import { MemberProfileBasicSection } from "./MemberProfileBasicSection";
import { MemberProfileNotesSection } from "./MemberProfileNotesSection";
import { MemberProfileProfessionalSection } from "./MemberProfileProfessionalSection";
import { MemberProfileServiceSection } from "./MemberProfileServiceSection";
import { MemberProfileSpiritualSection } from "./MemberProfileSpiritualSection";

interface MemberProfileDetailScreenProps {
  memberId: string;
}

export function MemberProfileDetailScreen({
  memberId,
}: MemberProfileDetailScreenProps) {
  usePermissions({
    requiredPermissions: [Permission.MEMBER_PROFILE_READ],
    redirectTo: "/home",
  });

  const { profile, isLoading } = useMemberProfileDetail(memberId);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen app-background p-6 pt-20">
        <PrivateHeader title="Perfil do membro" backHref="/member-profiles" />
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-background p-6 pt-20">
      <div className="mx-auto max-w-3xl space-y-4">
        <PrivateHeader
          title={profile.fullName}
          subtitle="Respostas do autocadastro"
          backHref="/member-profiles"
        />

        {!profile.hasCompleteProfile && (
          <div className="rounded-lg border border-primary/20 bg-card p-4 text-sm text-muted-foreground">
            Este membro ainda nao possui todas as secoes do autocadastro.
          </div>
        )}

        <MemberProfileBasicSection profile={profile} />
        <MemberProfileSpiritualSection profile={profile} />
        <MemberProfileServiceSection profile={profile} />
        <MemberProfileProfessionalSection profile={profile} />
        <MemberProfileNotesSection profile={profile} />
      </div>
    </div>
  );
}
