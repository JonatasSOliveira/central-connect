import { validateSession } from "@/app/api/_lib/auth";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import { GetMemberProfile } from "@/modules/member-profiles/application/use-cases/GetMemberProfile";
import { ListMemberProfiles } from "@/modules/member-profiles/application/use-cases/ListMemberProfiles";
import { MemberFinalNotesDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberFinalNotesDrizzleRepository";
import { MemberPersonalInfoDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberPersonalInfoDrizzleRepository";
import { MemberPracticalSkillDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberPracticalSkillDrizzleRepository";
import { MemberProfessionalProfileDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberProfessionalProfileDrizzleRepository";
import { MemberServiceAvailabilityDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberServiceAvailabilityDrizzleRepository";
import { MemberServiceProfileDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberServiceProfileDrizzleRepository";
import { MemberSpiritualJourneyDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberSpiritualJourneyDrizzleRepository";
import { createMemberProfileHandler } from "@/modules/member-profiles/presentation/http/handlers/member-profile-handler";
import { createMemberProfilesHandler } from "@/modules/member-profiles/presentation/http/handlers/member-profiles-handler";
import { MemberChurchDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberChurchDrizzleRepository";
import { MemberDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberDrizzleRepository";
import { MemberMinistryDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryDrizzleRepository";
import { MemberMinistryInterestDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryInterestDrizzleRepository";
import { MinistryDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryDrizzleRepository";

export function createMemberProfilesComposition() {
  const database = getDatabaseClient();
  const memberRepository = new MemberDrizzleRepository(database);
  const memberChurchRepository = new MemberChurchDrizzleRepository(database);
  const memberMinistryRepository = new MemberMinistryDrizzleRepository(
    database,
  );
  const ministryRepository = new MinistryDrizzleRepository(database);
  const personalInfoRepository = new MemberPersonalInfoDrizzleRepository(
    database,
  );
  const spiritualJourneyRepository =
    new MemberSpiritualJourneyDrizzleRepository(database);
  const serviceProfileRepository = new MemberServiceProfileDrizzleRepository(
    database,
  );
  const ministryInterestRepository =
    new MemberMinistryInterestDrizzleRepository(database);
  const serviceAvailabilityRepository =
    new MemberServiceAvailabilityDrizzleRepository(database);
  const professionalProfileRepository =
    new MemberProfessionalProfileDrizzleRepository(database);
  const practicalSkillRepository = new MemberPracticalSkillDrizzleRepository(
    database,
  );
  const finalNotesRepository = new MemberFinalNotesDrizzleRepository(database);
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
