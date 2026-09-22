import { MemberFinalNotesFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberFinalNotesFirebaseRepository";
import { MemberPersonalInfoFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberPersonalInfoFirebaseRepository";
import { MemberPracticalSkillFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberPracticalSkillFirebaseRepository";
import { MemberProfessionalProfileFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberProfessionalProfileFirebaseRepository";
import { MemberServiceAvailabilityFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberServiceAvailabilityFirebaseRepository";
import { MemberServiceProfileFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberServiceProfileFirebaseRepository";
import { MemberSpiritualJourneyFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberSpiritualJourneyFirebaseRepository";
import { MemberMinistryInterestFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberMinistryInterestFirebaseRepository";
import type { SaveSelfSignupMemberFormRepositories } from "@/modules/self-signup/application/use-cases/helpers/saveSelfSignupMemberForm";

let repositories: SaveSelfSignupMemberFormRepositories | null = null;

export function getSelfSignupMemberFormRepositories(): SaveSelfSignupMemberFormRepositories {
  repositories ??= {
    personalInfoRepository: new MemberPersonalInfoFirebaseRepository(),
    spiritualJourneyRepository: new MemberSpiritualJourneyFirebaseRepository(),
    serviceProfileRepository: new MemberServiceProfileFirebaseRepository(),
    ministryInterestRepository: new MemberMinistryInterestFirebaseRepository(),
    serviceAvailabilityRepository:
      new MemberServiceAvailabilityFirebaseRepository(),
    professionalProfileRepository:
      new MemberProfessionalProfileFirebaseRepository(),
    practicalSkillRepository: new MemberPracticalSkillFirebaseRepository(),
    finalNotesRepository: new MemberFinalNotesFirebaseRepository(),
  };

  return repositories;
}
