import { validateSession } from "@/shared/presentation/http/auth";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryInterestRepository } from "@/modules/members/application/ports/IMemberMinistryInterestRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import { GetMemberProfile } from "@/modules/member-profiles/application/use-cases/GetMemberProfile";
import { ListMemberProfiles } from "@/modules/member-profiles/application/use-cases/ListMemberProfiles";
import type { IMemberFinalNotesRepository } from "@/modules/member-profiles/application/ports/IMemberFinalNotesRepository";
import type { IMemberPersonalInfoRepository } from "@/modules/member-profiles/application/ports/IMemberPersonalInfoRepository";
import type { IMemberPracticalSkillRepository } from "@/modules/member-profiles/application/ports/IMemberPracticalSkillRepository";
import type { IMemberProfessionalProfileRepository } from "@/modules/member-profiles/application/ports/IMemberProfessionalProfileRepository";
import type { IMemberServiceAvailabilityRepository } from "@/modules/member-profiles/application/ports/IMemberServiceAvailabilityRepository";
import type { IMemberServiceProfileRepository } from "@/modules/member-profiles/application/ports/IMemberServiceProfileRepository";
import type { IMemberSpiritualJourneyRepository } from "@/modules/member-profiles/application/ports/IMemberSpiritualJourneyRepository";
import { createMemberProfileHandler } from "@/modules/member-profiles/presentation/http/handlers/member-profile-handler";
import { createMemberProfilesHandler } from "@/modules/member-profiles/presentation/http/handlers/member-profiles-handler";

export function createMemberProfilesComposition(externalDependencies: {
  memberRepository: IMemberRepository;
  memberChurchRepository: IMemberChurchRepository;
  memberMinistryRepository: IMemberMinistryRepository;
  ministryRepository: IMinistryRepository;
  ministryInterestRepository: IMemberMinistryInterestRepository;
  personalInfoRepository: IMemberPersonalInfoRepository;
  spiritualJourneyRepository: IMemberSpiritualJourneyRepository;
  serviceProfileRepository: IMemberServiceProfileRepository;
  serviceAvailabilityRepository: IMemberServiceAvailabilityRepository;
  professionalProfileRepository: IMemberProfessionalProfileRepository;
  practicalSkillRepository: IMemberPracticalSkillRepository;
  finalNotesRepository: IMemberFinalNotesRepository;
}) {
  const repositories = [
    externalDependencies.memberRepository,
    externalDependencies.memberChurchRepository,
    externalDependencies.memberMinistryRepository,
    externalDependencies.ministryRepository,
    externalDependencies.personalInfoRepository,
    externalDependencies.spiritualJourneyRepository,
    externalDependencies.serviceProfileRepository,
    externalDependencies.ministryInterestRepository,
    externalDependencies.serviceAvailabilityRepository,
    externalDependencies.professionalProfileRepository,
    externalDependencies.practicalSkillRepository,
    externalDependencies.finalNotesRepository,
  ] as const;
  const useCases = {
    listMemberProfiles: new ListMemberProfiles(...repositories),
    getMemberProfile: new GetMemberProfile(...repositories),
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
