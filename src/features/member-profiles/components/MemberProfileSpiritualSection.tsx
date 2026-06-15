import type { MemberProfileDetailDTO } from "@/application/dtos/member-profile/MemberProfileDTO";
import { memberProfileLabels } from "./member-profile-labels";
import { MemberProfileField } from "./MemberProfileField";
import { MemberProfileSection } from "./MemberProfileSection";

interface MemberProfileSpiritualSectionProps {
  profile: MemberProfileDetailDTO;
}

export function MemberProfileSpiritualSection({
  profile,
}: MemberProfileSpiritualSectionProps) {
  const journey = profile.spiritualJourney;

  return (
    <MemberProfileSection title="Caminhada espiritual">
      <MemberProfileField
        label="Aceitou Jesus"
        value={journey ? memberProfileLabels.acceptedJesus[journey.acceptedJesus] : null}
      />
      <MemberProfileField
        label="Batismo"
        value={journey ? memberProfileLabels.waterBaptized[journey.waterBaptized] : null}
      />
      <MemberProfileField
        label="Detalhes do batismo"
        value={journey?.baptismDetails}
      />
      <MemberProfileField
        label="Discipulado"
        value={
          journey
            ? memberProfileLabels.discipleshipStatus[journey.discipleshipStatus]
            : null
        }
      />
      <MemberProfileField
        label="Tempo de igreja"
        value={
          journey
            ? memberProfileLabels.churchAttendanceTime[journey.churchAttendanceTime]
            : null
        }
      />
      <MemberProfileField
        label="Pequeno grupo"
        value={journey ? memberProfileLabels.smallGroupStatus[journey.smallGroupStatus] : null}
      />
      <MemberProfileField
        label="Membro oficial"
        value={
          journey
            ? memberProfileLabels.officialMemberStatus[journey.officialMemberStatus]
            : null
        }
      />
    </MemberProfileSection>
  );
}
