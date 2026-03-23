import { CreateMemberWithChurch } from "@/application/use-cases/member/CreateMemberWithChurch";
import { LinkUserToMember } from "@/application/use-cases/member/LinkUserToMember";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import { MemberChurchFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberChurchFirebaseRepository";
import { MemberFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberFirebaseRepository";
import { UserFirebaseRepository } from "@/infra/firebase-admin/repositories/UserFirebaseRepository";

class MemberContainer {
  private static _memberRepository: IMemberRepository | null = null;
  private static _memberChurchRepository: IMemberChurchRepository | null = null;
  private static _userRepository: IUserRepository | null = null;
  private static _createMemberWithChurch: CreateMemberWithChurch | null = null;
  private static _linkUserToMember: LinkUserToMember | null = null;

  private constructor() {}

  static get memberRepository(): IMemberRepository {
    if (!MemberContainer._memberRepository) {
      MemberContainer._memberRepository = new MemberFirebaseRepository();
    }
    return MemberContainer._memberRepository;
  }

  static get memberChurchRepository(): IMemberChurchRepository {
    if (!MemberContainer._memberChurchRepository) {
      MemberContainer._memberChurchRepository =
        new MemberChurchFirebaseRepository();
    }
    return MemberContainer._memberChurchRepository;
  }

  static get userRepository(): IUserRepository {
    if (!MemberContainer._userRepository) {
      MemberContainer._userRepository = new UserFirebaseRepository();
    }
    return MemberContainer._userRepository;
  }

  static get createMemberWithChurch(): CreateMemberWithChurch {
    if (!MemberContainer._createMemberWithChurch) {
      MemberContainer._createMemberWithChurch = new CreateMemberWithChurch(
        MemberContainer.memberRepository,
        MemberContainer.memberChurchRepository,
      );
    }
    return MemberContainer._createMemberWithChurch;
  }

  static get linkUserToMember(): LinkUserToMember {
    if (!MemberContainer._linkUserToMember) {
      MemberContainer._linkUserToMember = new LinkUserToMember(
        MemberContainer.userRepository,
      );
    }
    return MemberContainer._linkUserToMember;
  }
}

export const memberContainer = MemberContainer;
