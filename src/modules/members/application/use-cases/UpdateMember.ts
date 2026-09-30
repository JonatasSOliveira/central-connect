import type { IMemberAvailabilityRepository } from "@/modules/members/application/ports/IMemberAvailabilityRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import {
  Member,
  type MemberParams,
} from "@/modules/members/domain/entities/Member";
import {
  MemberAvailability,
  type MemberAvailabilityParams,
} from "@/modules/members/domain/entities/MemberAvailability";
import {
  MemberChurch,
  type MemberChurchParams,
} from "@/modules/members/domain/entities/MemberChurch";
import {
  MemberMinistry,
  type MemberMinistryParams,
} from "@/modules/members/domain/entities/MemberMinistry";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type { UpdateMemberInput } from "../dtos/member/CreateMemberDTO";

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
        const requestedChurchIds = new Set(
          input.churches.map((church) => church.churchId),
        );

        for (const existingMc of existingMemberChurches) {
          if (!requestedChurchIds.has(existingMc.churchId)) {
            await this.memberChurchRepository.delete(existingMc.id);
          }
        }

        const existingMemberMinistries =
          await this.memberMinistryRepository.findByMemberId(memberId);
        const requestedMinistryKeys = new Set(
          input.churches.flatMap((church) =>
            church.ministryIds.map(
              (ministryId) => `${church.churchId}:${ministryId}`,
            ),
          ),
        );

        for (const existingMm of existingMemberMinistries) {
          const key = `${existingMm.churchId}:${existingMm.ministryId}`;
          if (!requestedMinistryKeys.has(key)) {
            await this.memberMinistryRepository.delete(existingMm.id);
          }
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
          await this.memberChurchRepository.upsert(memberChurch);

          for (const ministryId of churchInfo.ministryIds || []) {
            const memberMinistryParams: MemberMinistryParams = {
              memberId,
              churchId: churchInfo.churchId,
              ministryId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            const memberMinistry = new MemberMinistry(memberMinistryParams);
            await this.memberMinistryRepository.upsert(memberMinistry);
          }
        }
      }

      if (input.ministryAssignments !== undefined) {
        const existingMemberChurches =
          await this.memberChurchRepository.findByMemberId(memberId);
        const existingChurchIds = new Set(
          existingMemberChurches.map((memberChurch) => memberChurch.churchId),
        );

        for (const assignment of input.ministryAssignments) {
          if (!existingChurchIds.has(assignment.churchId)) {
            return {
              ok: false,
              error: {
                code: "MEMBER_CHURCH_NOT_FOUND",
                message: "Membro nao pertence a esta igreja",
              },
            };
          }
        }

        const assignmentChurchIds = new Set(
          input.ministryAssignments.map((assignment) => assignment.churchId),
        );
        const existingMemberMinistries =
          await this.memberMinistryRepository.findByMemberId(memberId);
        const requestedMinistryKeys = new Set(
          input.ministryAssignments.flatMap((assignment) =>
            assignment.ministryIds.map(
              (ministryId) => `${assignment.churchId}:${ministryId}`,
            ),
          ),
        );

        for (const existingMm of existingMemberMinistries) {
          const key = `${existingMm.churchId}:${existingMm.ministryId}`;
          if (
            assignmentChurchIds.has(existingMm.churchId) &&
            !requestedMinistryKeys.has(key)
          ) {
            await this.memberMinistryRepository.delete(existingMm.id);
          }
        }

        for (const assignment of input.ministryAssignments) {
          for (const ministryId of assignment.ministryIds) {
            const memberMinistryParams: MemberMinistryParams = {
              memberId,
              churchId: assignment.churchId,
              ministryId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            const memberMinistry = new MemberMinistry(memberMinistryParams);
            await this.memberMinistryRepository.upsert(memberMinistry);
          }
        }
      }

      if (input.availability) {
        const memberAvailabilityParams: MemberAvailabilityParams = {
          memberId,
          daysOfWeek: input.availability.daysOfWeek,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const memberAvailability = new MemberAvailability(
          memberAvailabilityParams,
        );

        await this.memberAvailabilityRepository.upsert(memberAvailability);
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
