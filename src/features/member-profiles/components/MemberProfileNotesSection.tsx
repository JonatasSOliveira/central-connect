import type { MemberProfileDetailDTO } from "@/application/dtos/member-profile/MemberProfileDTO";
import { MemberProfileField } from "./MemberProfileField";
import { MemberProfileSection } from "./MemberProfileSection";

interface MemberProfileNotesSectionProps {
  profile: MemberProfileDetailDTO;
}

export function MemberProfileNotesSection({
  profile,
}: MemberProfileNotesSectionProps) {
  return (
    <MemberProfileSection title="Observacoes finais">
      <MemberProfileField
        label="Limitacoes de saude"
        value={profile.finalNotes?.healthLimitations}
      />
      <MemberProfileField
        label="Notas para lideranca"
        value={profile.finalNotes?.leadershipNotes}
      />
    </MemberProfileSection>
  );
}
