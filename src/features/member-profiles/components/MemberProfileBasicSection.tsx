import type { MemberProfileDetailDTO } from "@/application/dtos/member-profile/MemberProfileDTO";
import { memberProfileLabels, yesNoLabel } from "./member-profile-labels";
import { MemberProfileField } from "./MemberProfileField";
import { MemberProfileSection } from "./MemberProfileSection";

interface MemberProfileBasicSectionProps {
  profile: MemberProfileDetailDTO;
}

export function MemberProfileBasicSection({
  profile,
}: MemberProfileBasicSectionProps) {
  return (
    <MemberProfileSection title="Dados basicos">
      <MemberProfileField label="Nome" value={profile.fullName} />
      <MemberProfileField label="Telefone" value={profile.phone} />
      <MemberProfileField label="Email" value={profile.email} />
      <MemberProfileField label="Nascimento" value={profile.birthDate} />
      <MemberProfileField
        label="Estado civil"
        value={
          profile.personalInfo
            ? memberProfileLabels.maritalStatus[
                profile.personalInfo.maritalStatus
              ]
            : null
        }
      />
      <MemberProfileField
        label="Filhos"
        value={
          profile.personalInfo
            ? `${yesNoLabel(profile.personalInfo.hasChildren)}${
                profile.personalInfo.childrenCount
                  ? ` (${profile.personalInfo.childrenCount})`
                  : ""
              }`
            : null
        }
      />
      <MemberProfileField
        label="Idade dos filhos"
        value={profile.personalInfo?.childrenAges}
      />
      <MemberProfileField
        label="Bairro"
        value={profile.personalInfo?.neighborhood}
      />
    </MemberProfileSection>
  );
}
