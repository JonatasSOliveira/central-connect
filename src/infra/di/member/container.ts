import { CreateMember } from "@/application/use-cases/member/CreateMember";
import { GetMember } from "@/application/use-cases/member/GetMember";
import { ListMembers } from "@/application/use-cases/member/ListMembers";
import { UpdateMember } from "@/application/use-cases/member/UpdateMember";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import { ChurchFirebaseRepository } from "@/infra/firebase-admin/repositories/ChurchFirebaseRepository";
import { MemberChurchFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberChurchFirebaseRepository";
import { MemberFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberFirebaseRepository";
import { RoleFirebaseRepository } from "@/infra/firebase-admin/repositories/RoleFirebaseRepository";

class MemberContainer {
  private static _memberRepository: IMemberRepository | null = null;
  private static _memberChurchRepository: IMemberChurchRepository | null = null;
  private static _churchRepository: IChurchRepository | null = null;
  private static _roleRepository: IRoleRepository | null = null;
  private static _listMembers: ListMembers | null = null;
  private static _createMember: CreateMember | null = null;
  private static _getMember: GetMember | null = null;
  private static _updateMember: UpdateMember | null = null;

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

  static get churchRepository(): IChurchRepository {
    if (!MemberContainer._churchRepository) {
      MemberContainer._churchRepository = new ChurchFirebaseRepository();
    }
    return MemberContainer._churchRepository;
  }

  static get roleRepository(): IRoleRepository {
    if (!MemberContainer._roleRepository) {
      MemberContainer._roleRepository = new RoleFirebaseRepository();
    }
    return MemberContainer._roleRepository;
  }

  static get listMembers(): ListMembers {
    if (!MemberContainer._listMembers) {
      MemberContainer._listMembers = new ListMembers(
        MemberContainer.memberRepository,
        MemberContainer.memberChurchRepository,
        MemberContainer.churchRepository,
      );
    }
    return MemberContainer._listMembers;
  }

  static get createMember(): CreateMember {
    if (!MemberContainer._createMember) {
      MemberContainer._createMember = new CreateMember(
        MemberContainer.memberRepository,
        MemberContainer.memberChurchRepository,
      );
    }
    return MemberContainer._createMember;
  }

  static get getMember(): GetMember {
    if (!MemberContainer._getMember) {
      MemberContainer._getMember = new GetMember(
        MemberContainer.memberRepository,
        MemberContainer.memberChurchRepository,
        MemberContainer.churchRepository,
        MemberContainer.roleRepository,
      );
    }
    return MemberContainer._getMember;
  }

  static get updateMember(): UpdateMember {
    if (!MemberContainer._updateMember) {
      MemberContainer._updateMember = new UpdateMember(
        MemberContainer.memberRepository,
        MemberContainer.memberChurchRepository,
      );
    }
    return MemberContainer._updateMember;
  }
}

export const memberContainer = MemberContainer;
