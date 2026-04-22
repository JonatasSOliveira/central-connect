import { Member, type MemberParams } from "@/domain/entities/Member";
import {
  MemberAvailability,
  type MemberAvailabilityParams,
} from "@/domain/entities/MemberAvailability";
import {
  MemberChurch,
  type MemberChurchParams,
} from "@/domain/entities/MemberChurch";
import {
  MemberMinistry,
  type MemberMinistryParams,
} from "@/domain/entities/MemberMinistry";
import type { IMemberAvailabilityRepository } from "@/domain/ports/IMemberAvailabilityRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/domain/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import type { UpdateMemberInput } from "../../dtos/member/CreateMemberDTO";
import { BaseUseCase } from "../BaseUseCase";

export class UpdateMember extends BaseUseCase<
  { memberId: string; input: UpdateMemberInput },
  { id: string; email: string; fullName: string }
> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly memberMinistryRepository: IMemberMinistryRepository,
    private readonly memberAvailabilityRepository: IMemberAvailabilityRepository,
  ) {
    super();
  }

  async execute({
    memberId,
    input,
  }: {
    memberId: string;
    input: UpdateMemberInput;
  }): Promise<Result<{ id: string; email: string; fullName: string }>> {
    try {
      const member = await this.memberRepository.findById(memberId);
      if (!member) {
        return {
          ok: false,
          error: {
            code: "MEMBER_NOT_FOUND",
            message: "Membro não encontrado",
          },
        };
      }

      const memberParams: MemberParams = {
        email: input.email !== undefined ? (input.email ?? null) : member.email,
        fullName: input.fullName ?? member.fullName,
        phone: input.phone !== undefined ? (input.phone ?? null) : member.phone,
        status: member.status,
        createdAt: member.createdAt,
        updatedAt: new Date(),
      };

      const updatedMember = new Member({ ...memberParams, id: memberId });
      const result = await this.memberRepository.update(updatedMember);

      if (input.churches !== undefined) {
        const existingMemberChurches =
          await this.memberChurchRepository.findByMemberId(memberId);

        for (const existingMc of existingMemberChurches) {
          await this.memberChurchRepository.delete(existingMc.id);
        }

        const existingMemberMinistries =
          await this.memberMinistryRepository.findByMemberId(memberId);
        for (const existingMm of existingMemberMinistries) {
          await this.memberMinistryRepository.delete(existingMm.id);
        }

        for (const churchInfo of input.churches) {
          const memberChurchParams: MemberChurchParams = {
            memberId: memberId,
            churchId: churchInfo.churchId,
            roleId: churchInfo.roleId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const memberChurch = new MemberChurch(memberChurchParams);
          await this.memberChurchRepository.create(memberChurch);

          for (const ministryId of churchInfo.ministryIds || []) {
            const memberMinistryParams: MemberMinistryParams = {
              memberId,
              churchId: churchInfo.churchId,
              ministryId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            const memberMinistry = new MemberMinistry(memberMinistryParams);
            await this.memberMinistryRepository.create(memberMinistry);
          }
        }
      }

      if (input.availability) {
        const churchesToApply =
          input.churches?.map((churchInfo) => churchInfo.churchId) ??
          (await this.memberChurchRepository.findByMemberId(memberId)).map(
            (church) => church.churchId,
          );

        for (const churchId of churchesToApply) {
          const memberAvailabilityParams: MemberAvailabilityParams = {
            memberId,
            churchId,
            mode: input.availability.mode,
            daysOfWeek: input.availability.daysOfWeek,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const memberAvailability = new MemberAvailability(
            memberAvailabilityParams,
          );

          await this.memberAvailabilityRepository.upsert(memberAvailability);
        }
      }

      return {
        ok: true,
        value: {
          id: result.id,
          email: result.email ?? "",
          fullName: result.fullName,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "UPDATE_MEMBER_FAILED",
          message: "Falha ao atualizar membro",
        },
      };
    }
  }
}
