import { Member, type MemberParams } from "@/domain/entities/Member";
import {
  MemberChurch,
  type MemberChurchParams,
} from "@/domain/entities/MemberChurch";
import {
  MemberMinistry,
  type MemberMinistryParams,
} from "@/domain/entities/MemberMinistry";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/domain/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import type {
  CreateMemberInput,
  CreateMemberOutput,
} from "../../dtos/member/CreateMemberDTO";
import { BaseUseCase } from "../BaseUseCase";

export class CreateMember extends BaseUseCase<
  CreateMemberInput,
  CreateMemberOutput
> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly memberMinistryRepository: IMemberMinistryRepository,
  ) {
    super();
  }

  async execute(input: CreateMemberInput): Promise<Result<CreateMemberOutput>> {
    try {
      if (input.email) {
        const existingMember = await this.memberRepository.findByEmail(
          input.email,
        );
        if (existingMember) {
          return {
            ok: false,
            error: {
              code: "MEMBER_ALREADY_EXISTS",
              message: "Já existe um membro com este email",
            },
          };
        }
      }

      const memberParams: MemberParams = {
        email: input.email ?? null,
        fullName: input.fullName,
        phone: input.phone ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const member = new Member(memberParams);
      const createdMember = await this.memberRepository.create(member);

      for (const churchInfo of input.churches) {
        const memberChurchParams: MemberChurchParams = {
          memberId: createdMember.id,
          churchId: churchInfo.churchId,
          roleId: churchInfo.roleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const memberChurch = new MemberChurch(memberChurchParams);
        await this.memberChurchRepository.create(memberChurch);

        for (const ministryId of churchInfo.ministryIds || []) {
          const memberMinistryParams: MemberMinistryParams = {
            memberId: createdMember.id,
            churchId: churchInfo.churchId,
            ministryId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const memberMinistry = new MemberMinistry(memberMinistryParams);
          await this.memberMinistryRepository.create(memberMinistry);
        }
      }

      return {
        ok: true,
        value: {
          id: createdMember.id,
          email: createdMember.email ?? "",
          fullName: createdMember.fullName,
          phone: createdMember.phone,
          status: createdMember.status,
          avatarUrl: createdMember.avatarUrl,
          createdAt: createdMember.createdAt,
          updatedAt: createdMember.updatedAt,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "CREATE_MEMBER_FAILED",
          message: "Falha ao criar membro",
        },
      };
    }
  }
}
