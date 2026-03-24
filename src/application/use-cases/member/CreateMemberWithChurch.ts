import { Member, type MemberParams } from "@/domain/entities/Member";
import {
  MemberChurch,
  type MemberChurchParams,
} from "@/domain/entities/MemberChurch";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import { MemberErrors } from "../../errors/MemberErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface CreateMemberWithChurchInput {
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  churchId: string;
  roleId: string;
}

export interface CreateMemberWithChurchOutput {
  member: Member;
  memberChurch: MemberChurch;
}

export class CreateMemberWithChurch extends BaseUseCase<
  CreateMemberWithChurchInput,
  CreateMemberWithChurchOutput
> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
  ) {
    super();
  }

  async execute(
    input: CreateMemberWithChurchInput,
  ): Promise<Result<CreateMemberWithChurchOutput>> {
    try {
      const existingMember = await this.memberRepository.findByEmail(
        input.email,
      );
      if (existingMember) {
        return {
          ok: false,
          error: MemberErrors.MEMBER_ALREADY_EXISTS,
        };
      }

      const memberParams: MemberParams = {
        email: input.email,
        fullName: input.fullName,
        avatarUrl: input.avatarUrl ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const member = new Member(memberParams);
      const createdMember = await this.memberRepository.create(member);

      const memberChurchParams: MemberChurchParams = {
        memberId: createdMember.id,
        churchId: input.churchId,
        roleId: input.roleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const memberChurch = new MemberChurch(memberChurchParams);
      const createdMemberChurch =
        await this.memberChurchRepository.create(memberChurch);

      return {
        ok: true,
        value: {
          member: createdMember,
          memberChurch: createdMemberChurch,
        },
      };
    } catch {
      return {
        ok: false,
        error: MemberErrors.MEMBER_CREATION_FAILED,
      };
    }
  }
}
