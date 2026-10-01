import type { IMemberAvailabilityRepository } from "@/modules/members/application/ports/IMemberAvailabilityRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberMinistryRoleRepository } from "@/modules/members/application/ports/IMemberMinistryRoleRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import {
  Member,
  type MemberParams,
} from "@/modules/members/domain/entities/Member";
import {
  MemberAvailability,
  type MemberAvailabilityParams,
} from "@/modules/members/domain/entities/MemberAvailability";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type { UpdateMemberInput } from "../dtos/member/CreateMemberDTO";
import { syncMemberRelations } from "./helpers/syncMemberRelations";
import { syncMemberMinistryRoles } from "./helpers/syncMemberMinistryRoles";

export class UpdateMember extends BaseUseCase<
  { memberId: string; input: UpdateMemberInput },
  { id: string; email: string; fullName: string }
> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly memberMinistryRepository: IMemberMinistryRepository,
    private readonly memberMinistryRoleRepository: IMemberMinistryRoleRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
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

      const relationResult = await syncMemberRelations(
        {
          memberChurchRepository: this.memberChurchRepository,
          memberMinistryRepository: this.memberMinistryRepository,
          memberMinistryRoleRepository: this.memberMinistryRoleRepository,
        },
        memberId,
        input,
      );
      if (!relationResult.ok) {
        return { ok: false, error: relationResult };
      }

      for (const assignment of input.ministryRoleAssignments ?? []) {
        const result = await syncMemberMinistryRoles(
          {
            memberMinistryRepository: this.memberMinistryRepository,
            memberMinistryRoleRepository: this.memberMinistryRoleRepository,
            ministryRoleRepository: this.ministryRoleRepository,
          },
          { ...assignment, memberId },
        );

        if (!result.ok) {
          return { ok: false, error: result };
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
