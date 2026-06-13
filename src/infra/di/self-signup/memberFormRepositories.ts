import type { SaveSelfSignupMemberFormRepositories } from "@/application/use-cases/self-signup/helpers/saveSelfSignupMemberForm";
import { MemberFinalNotesFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberFinalNotesFirebaseRepository";
import { MemberMinistryInterestFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberMinistryInterestFirebaseRepository";
import { MemberPersonalInfoFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberPersonalInfoFirebaseRepository";
import { MemberPracticalSkillFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberPracticalSkillFirebaseRepository";
import { MemberProfessionalProfileFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberProfessionalProfileFirebaseRepository";
import { MemberServiceAvailabilityFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberServiceAvailabilityFirebaseRepository";
import { MemberServiceProfileFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberServiceProfileFirebaseRepository";
import { MemberSpiritualJourneyFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberSpiritualJourneyFirebaseRepository";

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
