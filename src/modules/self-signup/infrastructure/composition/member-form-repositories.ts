import { getDatabaseClient } from "@/infra/database/get-database-client";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { MemberFinalNotesDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberFinalNotesDrizzleRepository";
import { MemberPersonalInfoDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberPersonalInfoDrizzleRepository";
import { MemberPracticalSkillDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberPracticalSkillDrizzleRepository";
import { MemberProfessionalProfileDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberProfessionalProfileDrizzleRepository";
import { MemberServiceAvailabilityDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberServiceAvailabilityDrizzleRepository";
import { MemberServiceProfileDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberServiceProfileDrizzleRepository";
import { MemberSpiritualJourneyDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberSpiritualJourneyDrizzleRepository";
import { MemberMinistryInterestDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryInterestDrizzleRepository";
import type { SaveSelfSignupMemberFormRepositories } from "@/modules/self-signup/application/use-cases/helpers/saveSelfSignupMemberForm";

export function getSelfSignupMemberFormRepositories(
  database: DatabaseExecutor = getDatabaseClient(),
): SaveSelfSignupMemberFormRepositories {
  return {
    personalInfoRepository: new MemberPersonalInfoDrizzleRepository(database),
    spiritualJourneyRepository: new MemberSpiritualJourneyDrizzleRepository(
      database,
    ),
    serviceProfileRepository: new MemberServiceProfileDrizzleRepository(
      database,
    ),
    ministryInterestRepository: new MemberMinistryInterestDrizzleRepository(
      database,
    ),
    serviceAvailabilityRepository:
      new MemberServiceAvailabilityDrizzleRepository(database),
    professionalProfileRepository:
      new MemberProfessionalProfileDrizzleRepository(database),
    practicalSkillRepository: new MemberPracticalSkillDrizzleRepository(
      database,
    ),
    finalNotesRepository: new MemberFinalNotesDrizzleRepository(database),
  };
}
