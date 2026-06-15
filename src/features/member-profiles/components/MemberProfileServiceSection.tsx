import type { MemberProfileDetailDTO } from "@/application/dtos/member-profile/MemberProfileDTO";
import { labelList, memberProfileLabels, yesNoLabel } from "./member-profile-labels";
import { MemberProfileField } from "./MemberProfileField";
import { MemberProfileSection } from "./MemberProfileSection";

interface MemberProfileServiceSectionProps {
  profile: MemberProfileDetailDTO;
}

export function MemberProfileServiceSection({
  profile,
}: MemberProfileServiceSectionProps) {
  const service = profile.serviceProfile;

  return (
    <MemberProfileSection title="Servico e ministerios">
      <MemberProfileField
        label="Serve atualmente"
        value={yesNoLabel(service?.currentlyServes)}
      />
      <MemberProfileField
        label="Ministerios atuais"
        value={labelList(service?.currentMinistryIds ?? [], profile.ministriesById)}
      />
      <MemberProfileField
        label="Ministerios desejados"
        value={labelList(service?.desiredMinistryIds ?? [], profile.ministriesById)}
      />
      <MemberProfileField
        label="Disponibilidade"
        value={labelList(
          service?.availabilitySlots ?? [],
          memberProfileLabels.availabilitySlots,
        )}
      />
      <MemberProfileField
        label="Instrumento"
        value={service?.instrumentalPraiseInstrument}
      />
      <MemberProfileField
        label="Outro ministerio"
        value={service?.otherDesiredMinistry}
      />
    </MemberProfileSection>
  );
}
