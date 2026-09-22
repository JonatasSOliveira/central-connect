import { validateSession } from "@/app/api/_lib/auth";
import { GetMemberProfile } from "@/modules/member-profiles/application/use-cases/GetMemberProfile";
import { ListMemberProfiles } from "@/modules/member-profiles/application/use-cases/ListMemberProfiles";
import { MemberFinalNotesFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberFinalNotesFirebaseRepository";
import { MemberPersonalInfoFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberPersonalInfoFirebaseRepository";
import { MemberPracticalSkillFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberPracticalSkillFirebaseRepository";
import { MemberProfessionalProfileFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberProfessionalProfileFirebaseRepository";
import { MemberServiceAvailabilityFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberServiceAvailabilityFirebaseRepository";
import { MemberServiceProfileFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberServiceProfileFirebaseRepository";
import { MemberSpiritualJourneyFirebaseRepository } from "@/modules/member-profiles/infrastructure/persistence/firebase/MemberSpiritualJourneyFirebaseRepository";
import { createMemberProfileHandler } from "@/modules/member-profiles/presentation/http/handlers/member-profile-handler";
import { createMemberProfilesHandler } from "@/modules/member-profiles/presentation/http/handlers/member-profiles-handler";
import { MemberChurchFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberChurchFirebaseRepository";
import { MemberFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberFirebaseRepository";
import { MemberMinistryFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberMinistryFirebaseRepository";
import { MemberMinistryInterestFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberMinistryInterestFirebaseRepository";
import { MinistryFirebaseRepository } from "@/modules/ministries/infrastructure/persistence/firebase/MinistryFirebaseRepository";

export function createMemberProfilesComposition() {
  const memberRepository = new MemberFirebaseRepository();
  const memberChurchRepository = new MemberChurchFirebaseRepository();
  const memberMinistryRepository = new MemberMinistryFirebaseRepository();
  const ministryRepository = new MinistryFirebaseRepository();
  const personalInfoRepository = new MemberPersonalInfoFirebaseRepository();
  const spiritualJourneyRepository =
    new MemberSpiritualJourneyFirebaseRepository();
  const serviceProfileRepository = new MemberServiceProfileFirebaseRepository();
  const ministryInterestRepository =
    new MemberMinistryInterestFirebaseRepository();
  const serviceAvailabilityRepository =
    new MemberServiceAvailabilityFirebaseRepository();
  const professionalProfileRepository =
    new MemberProfessionalProfileFirebaseRepository();
  const practicalSkillRepository = new MemberPracticalSkillFirebaseRepository();
  const finalNotesRepository = new MemberFinalNotesFirebaseRepository();
  const dependencies = [
    memberRepository,
    memberChurchRepository,
    memberMinistryRepository,
    ministryRepository,
    personalInfoRepository,
    spiritualJourneyRepository,
    serviceProfileRepository,
    ministryInterestRepository,
    serviceAvailabilityRepository,
    professionalProfileRepository,
    practicalSkillRepository,
    finalNotesRepository,
  ] as const;
  const useCases = {
    listMemberProfiles: new ListMemberProfiles(...dependencies),
    getMemberProfile: new GetMemberProfile(...dependencies),
  };
  return {
    useCases,
    httpHandlers: {
      memberProfiles: createMemberProfilesHandler(useCases, validateSession),
      memberProfile: createMemberProfileHandler(useCases, validateSession),
    },
  };
}

export type MemberProfilesComposition = ReturnType<
  typeof createMemberProfilesComposition
>;
