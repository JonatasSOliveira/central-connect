import type { MemberProfileDetailDTO } from "@/application/dtos/member-profile/MemberProfileDTO";
import { labelList, memberProfileLabels, yesNoLabel } from "./member-profile-labels";
import { MemberProfileField } from "./MemberProfileField";
import { MemberProfileSection } from "./MemberProfileSection";

interface MemberProfileProfessionalSectionProps {
  profile: MemberProfileDetailDTO;
}

export function MemberProfileProfessionalSection({
  profile,
}: MemberProfileProfessionalSectionProps) {
  const professional = profile.professionalProfile;

  return (
    <MemberProfileSection title="Profissional e habilidades">
      <MemberProfileField
        label="Profissao"
        value={professional?.currentProfession}
      />
      <MemberProfileField
        label="Mutirao"
        value={
          professional
            ? memberProfileLabels.mutiraoAvailability[
                professional.mutiraoAvailability
              ]
            : null
        }
      />
      <MemberProfileField
        label="Habilidades"
        value={labelList(
          professional?.skills.map((item) => item.skill) ?? [],
          memberProfileLabels.practicalSkills,
        )}
      />
      <MemberProfileField
        label="CNH"
        value={yesNoLabel(
          professional?.skills.find((item) => item.hasDriverLicense !== null)
            ?.hasDriverLicense,
        )}
      />
      <MemberProfileField
        label="Veiculo proprio"
        value={yesNoLabel(
          professional?.skills.find((item) => item.hasOwnVehicle !== null)
            ?.hasOwnVehicle,
        )}
      />
      <MemberProfileField
        label="Idiomas"
        value={professional?.skills.find((item) => item.languages)?.languages}
      />
      <MemberProfileField
        label="Outra habilidade"
        value={professional?.skills.find((item) => item.otherSkill)?.otherSkill}
      />
    </MemberProfileSection>
  );
}
