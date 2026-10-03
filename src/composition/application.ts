import {
  type ChurchesComposition,
  createChurchesComposition,
} from "@/modules/churches/composition/churches-composition";
import {
  createIdentityComposition,
  type IdentityComposition,
} from "@/modules/identity/composition/identity-composition";
import {
  createMemberProfilesComposition,
  type MemberProfilesComposition,
} from "@/modules/member-profiles/composition/member-profiles-composition";
import {
  createMembersComposition,
  type MembersComposition,
} from "@/modules/members/composition/members-composition";
import {
  createMinistriesComposition,
  type MinistriesComposition,
} from "@/modules/ministries/composition/ministries-composition";
import {
  createNotificationsComposition,
  type NotificationsComposition,
} from "@/modules/notifications/composition/notifications-composition";
import {
  createRolesComposition,
  type RolesComposition,
} from "@/modules/roles/composition/roles-composition";
import {
  createScalesComposition,
  type ScalesComposition,
} from "@/modules/scales/composition/scales-composition";
import {
  createSelfSignupComposition,
  type SelfSignupComposition,
} from "@/modules/self-signup/composition/self-signup-composition";
import {
  createServiceTemplatesComposition,
  type ServiceTemplatesComposition,
} from "@/modules/service-templates/composition/service-templates-composition";
import {
  createServicesComposition,
  type ServicesComposition,
} from "@/modules/services/composition/services-composition";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import { GoogleAuthFirebaseService } from "@/infra/firebase-admin/services/GoogleAuthFirebaseService";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";
import { ChurchDrizzleRepository } from "@/modules/churches/infrastructure/persistence/drizzle/ChurchDrizzleRepository";
import { MemberChurchDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberChurchDrizzleRepository";
import { MemberAvailabilityDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberAvailabilityDrizzleRepository";
import { MemberDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberDrizzleRepository";
import { MemberMinistryInterestDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryInterestDrizzleRepository";
import { MemberMinistryDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryDrizzleRepository";
import { MemberMinistryRoleDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryRoleDrizzleRepository";
import { MemberFinalNotesDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberFinalNotesDrizzleRepository";
import { MemberPersonalInfoDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberPersonalInfoDrizzleRepository";
import { MemberPracticalSkillDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberPracticalSkillDrizzleRepository";
import { MemberProfessionalProfileDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberProfessionalProfileDrizzleRepository";
import { MemberServiceAvailabilityDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberServiceAvailabilityDrizzleRepository";
import { MemberServiceProfileDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberServiceProfileDrizzleRepository";
import { MemberSpiritualJourneyDrizzleRepository } from "@/modules/member-profiles/infrastructure/persistence/drizzle/MemberSpiritualJourneyDrizzleRepository";
import { MinistryDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryDrizzleRepository";
import { MinistryRoleDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryRoleDrizzleRepository";
import { RoleDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RoleDrizzleRepository";
import { RolePermissionDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RolePermissionDrizzleRepository";
import { ScaleDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleDrizzleRepository";
import { ScaleAttendanceDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleAttendanceDrizzleRepository";
import { ScaleAttendanceMemberDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleAttendanceMemberDrizzleRepository";
import { ScaleGenerationJobDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleGenerationJobDrizzleRepository";
import { ServiceDrizzleRepository } from "@/modules/services/infrastructure/persistence/drizzle/ServiceDrizzleRepository";
import { ServiceTemplateDrizzleRepository } from "@/modules/service-templates/infrastructure/persistence/drizzle/ServiceTemplateDrizzleRepository";
import { MemberPushTokenDrizzleRepository } from "@/modules/notifications/infrastructure/persistence/drizzle/MemberPushTokenDrizzleRepository";
import { createNotificationsInfrastructure } from "@/modules/notifications/infrastructure/composition/notifications-infrastructure";
import { UserDrizzleRepository } from "@/modules/identity/infrastructure/persistence/drizzle/UserDrizzleRepository";
import { LegalConsentDrizzleRepository } from "@/modules/identity/infrastructure/persistence/drizzle/LegalConsentDrizzleRepository";
import { ScaleMemberDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleMemberDrizzleRepository";
import { ScaleNotificationServiceAdapter } from "@/modules/scales/infrastructure/services/ScaleNotificationServiceAdapter";
import { createScalesInfrastructure } from "@/modules/scales/infrastructure/composition/scales-infrastructure";
import { createSelfSignupInfrastructure } from "@/modules/self-signup/infrastructure/composition/self-signup-infrastructure";

export type Application = {
  ministries: MinistriesComposition;
  roles: RolesComposition;
  services: ServicesComposition;
  serviceTemplates: ServiceTemplatesComposition;
  churches: ChurchesComposition;
  members: MembersComposition;
  memberProfiles: MemberProfilesComposition;
  identity: IdentityComposition;
  selfSignup: SelfSignupComposition;
  scales: ScalesComposition;
  notifications: NotificationsComposition;
};

function createApplication(): Application {
  const database = getDatabaseClient();
  const churchRepository = new ChurchDrizzleRepository(database);
  const googleAuthService = new GoogleAuthFirebaseService();
  const tokenService = new JoseTokenJwtService();
  const userRepository = new UserDrizzleRepository(database);
  const memberRepository = new MemberDrizzleRepository(database);
  const memberChurchRepository = new MemberChurchDrizzleRepository(database);
  const memberAvailabilityRepository =
    new MemberAvailabilityDrizzleRepository(database);
  const memberMinistryRepository = new MemberMinistryDrizzleRepository(
    database,
  );
  const memberMinistryRoleRepository =
    new MemberMinistryRoleDrizzleRepository(database);
  const memberMinistryInterestRepository =
    new MemberMinistryInterestDrizzleRepository(database);
  const ministryRepository = new MinistryDrizzleRepository(database);
  const ministryRoleRepository = new MinistryRoleDrizzleRepository(database);
  const roleRepository = new RoleDrizzleRepository(database);
  const rolePermissionRepository = new RolePermissionDrizzleRepository(
    database,
  );
  const scaleRepository = new ScaleDrizzleRepository(database);
  const scaleAttendanceRepository = new ScaleAttendanceDrizzleRepository(
    database,
  );
  const scaleAttendanceMemberRepository =
    new ScaleAttendanceMemberDrizzleRepository(database);
  const scaleGenerationJobRepository = new ScaleGenerationJobDrizzleRepository(
    database,
  );
  const scaleMemberRepository = new ScaleMemberDrizzleRepository(database);
  const serviceRepository = new ServiceDrizzleRepository(database);
  const templateRepository = new ServiceTemplateDrizzleRepository(database);
  const profileRepositories = {
    personalInfoRepository: new MemberPersonalInfoDrizzleRepository(database),
    spiritualJourneyRepository: new MemberSpiritualJourneyDrizzleRepository(
      database,
    ),
    serviceProfileRepository: new MemberServiceProfileDrizzleRepository(
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
  const notificationInfrastructure = createNotificationsInfrastructure({
    serviceRepository,
    scaleRepository,
    scaleMemberRepository,
    memberPushTokenRepository: new MemberPushTokenDrizzleRepository(database),
  });
  const notificationService = new ScaleNotificationServiceAdapter(
    notificationInfrastructure,
  );
  const notifications = createNotificationsComposition(notificationInfrastructure);

  return {
    ministries: createMinistriesComposition({
      database,
      ministryRepository,
      ministryRoleRepository,
      scaleRepository,
      createTransactionalRepositories: (executor) => [
        new MinistryDrizzleRepository(executor),
        new MinistryRoleDrizzleRepository(executor),
      ],
    }),
    roles: createRolesComposition({ roleRepository, rolePermissionRepository }),
    services: createServicesComposition({ repository: serviceRepository }),
    serviceTemplates: createServiceTemplatesComposition({
      templateRepository,
      serviceRepository,
    }),
    churches: createChurchesComposition({
      churchRepository,
      memberChurchRepository,
      roleRepository,
    }),
    members: createMembersComposition({
      database,
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
      memberMinistryRoleRepository,
      memberAvailabilityRepository,
      createTransactionalRepositories: (executor) => [
        new MemberDrizzleRepository(executor),
        new MemberChurchDrizzleRepository(executor),
        new MemberMinistryDrizzleRepository(executor),
        new MemberMinistryRoleDrizzleRepository(executor),
        new MinistryRoleDrizzleRepository(executor),
        new MemberAvailabilityDrizzleRepository(executor),
      ],
      churchRepository,
      roleRepository,
      ministryRoleRepository,
    }),
    memberProfiles: createMemberProfilesComposition({
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
      ministryInterestRepository: memberMinistryInterestRepository,
      ministryRepository,
      ...profileRepositories,
    }),
    identity: createIdentityComposition({
      churchRepository,
      memberRepository,
      memberChurchRepository,
      rolePermissionRepository,
      googleAuthService,
      tokenService,
      userRepository,
    }),
    selfSignup: createSelfSignupComposition(createSelfSignupInfrastructure({
      database,
      churchRepository,
      roleRepository,
      rolePermissionRepository,
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
      ministryRepository,
      userRepository,
      legalConsentRepository: new LegalConsentDrizzleRepository(database),
      googleAuthService,
      createTransactionalRepositories: (executor) => [
        new ChurchDrizzleRepository(executor),
        new RoleDrizzleRepository(executor),
        new RolePermissionDrizzleRepository(executor),
        new MemberDrizzleRepository(executor),
        new MemberChurchDrizzleRepository(executor),
        new MemberMinistryDrizzleRepository(executor),
        new MinistryDrizzleRepository(executor),
        new UserDrizzleRepository(executor),
        new LegalConsentDrizzleRepository(executor),
      ],
      createMemberFormRepositories: (executor) => ({
        personalInfoRepository: new MemberPersonalInfoDrizzleRepository(
          executor,
        ),
        spiritualJourneyRepository: new MemberSpiritualJourneyDrizzleRepository(
          executor,
        ),
        serviceProfileRepository: new MemberServiceProfileDrizzleRepository(
          executor,
        ),
        ministryInterestRepository: new MemberMinistryInterestDrizzleRepository(
          executor,
        ),
        serviceAvailabilityRepository:
          new MemberServiceAvailabilityDrizzleRepository(executor),
        professionalProfileRepository:
          new MemberProfessionalProfileDrizzleRepository(executor),
        practicalSkillRepository: new MemberPracticalSkillDrizzleRepository(
          executor,
        ),
        finalNotesRepository: new MemberFinalNotesDrizzleRepository(executor),
      }),
    })),
    scales: createScalesComposition(createScalesInfrastructure({
      database,
      churchRepository,
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
      memberMinistryRoleRepository,
      memberAvailabilityRepository,
      ministryRepository,
      ministryRoleRepository,
      serviceRepository,
      notificationService,
      scaleRepository,
      scaleMemberRepository,
      scaleAttendanceRepository,
      scaleAttendanceMemberRepository,
      scaleGenerationJobRepository,
      createCreateScaleDependencies: (executor) => ({
        churchRepository: new ChurchDrizzleRepository(executor),
        serviceRepository: new ServiceDrizzleRepository(executor),
        ministryRepository: new MinistryDrizzleRepository(executor),
        ministryRoleRepository: new MinistryRoleDrizzleRepository(executor),
        memberRepository: new MemberDrizzleRepository(executor),
        memberChurchRepository: new MemberChurchDrizzleRepository(executor),
        memberMinistryRepository: new MemberMinistryDrizzleRepository(
          executor,
        ),
        memberMinistryRoleRepository: new MemberMinistryRoleDrizzleRepository(
          executor,
        ),
        memberAvailabilityRepository: new MemberAvailabilityDrizzleRepository(
          executor,
        ),
      }),
      createUpdateScaleDependencies: (executor) => ({
        churchRepository: new ChurchDrizzleRepository(executor),
        serviceRepository: new ServiceDrizzleRepository(executor),
        ministryRepository: new MinistryDrizzleRepository(executor),
        ministryRoleRepository: new MinistryRoleDrizzleRepository(executor),
        memberRepository: new MemberDrizzleRepository(executor),
        memberChurchRepository: new MemberChurchDrizzleRepository(executor),
        memberMinistryRepository: new MemberMinistryDrizzleRepository(
          executor,
        ),
        memberMinistryRoleRepository: new MemberMinistryRoleDrizzleRepository(
          executor,
        ),
      }),
    })),
    notifications,
  };
}

let application: Application | undefined;

export function getApplication(): Application {
  application ??= createApplication();
  return application;
}
