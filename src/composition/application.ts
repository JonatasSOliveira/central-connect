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
  return {
    ministries: createMinistriesComposition(),
    roles: createRolesComposition(),
    services: createServicesComposition(),
    serviceTemplates: createServiceTemplatesComposition(),
    churches: createChurchesComposition(),
    members: createMembersComposition(),
    memberProfiles: createMemberProfilesComposition(),
    identity: createIdentityComposition(),
    selfSignup: createSelfSignupComposition(),
    scales: createScalesComposition(),
    notifications: createNotificationsComposition(),
  };
}

let application: Application | undefined;

export function getApplication(): Application {
  application ??= createApplication();
  return application;
}
