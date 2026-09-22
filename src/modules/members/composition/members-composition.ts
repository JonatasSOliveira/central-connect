import { validateSession } from "@/app/api/_lib/auth";
import { ChurchFirebaseRepository } from "@/modules/churches/infrastructure/persistence/firebase/ChurchFirebaseRepository";
import { CreateMember } from "@/modules/members/application/use-cases/CreateMember";
import { DeleteMember } from "@/modules/members/application/use-cases/DeleteMember";
import { GetMember } from "@/modules/members/application/use-cases/GetMember";
import { ListMembers } from "@/modules/members/application/use-cases/ListMembers";
import { UpdateMember } from "@/modules/members/application/use-cases/UpdateMember";
import { MemberAvailabilityFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberAvailabilityFirebaseRepository";
import { MemberChurchFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberChurchFirebaseRepository";
import { MemberFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberFirebaseRepository";
import { MemberMinistryFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberMinistryFirebaseRepository";
import { createMemberHandler } from "@/modules/members/presentation/http/handlers/member-handler";
import { createMembersHandler } from "@/modules/members/presentation/http/handlers/members-handler";
import { RoleFirebaseRepository } from "@/modules/roles/infrastructure/persistence/firebase/RoleFirebaseRepository";

export function createMembersComposition() {
  const memberRepository = new MemberFirebaseRepository();
  const memberChurchRepository = new MemberChurchFirebaseRepository();
  const memberMinistryRepository = new MemberMinistryFirebaseRepository();
  const memberAvailabilityRepository =
    new MemberAvailabilityFirebaseRepository();
  const useCases = {
    listMembers: new ListMembers(
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
    ),
    createMember: new CreateMember(
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
      memberAvailabilityRepository,
    ),
    getMember: new GetMember(
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
      memberAvailabilityRepository,
      new ChurchFirebaseRepository(),
      new RoleFirebaseRepository(),
    ),
    updateMember: new UpdateMember(
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
      memberAvailabilityRepository,
    ),
    deleteMember: new DeleteMember(memberRepository, memberChurchRepository),
  };
  return {
    useCases,
    httpHandlers: {
      members: createMembersHandler(useCases, validateSession),
      member: createMemberHandler(useCases, validateSession),
    },
  };
}

export type MembersComposition = ReturnType<typeof createMembersComposition>;
