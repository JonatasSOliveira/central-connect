import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IMemberAvailabilityRepository } from "@/modules/members/application/ports/IMemberAvailabilityRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberMinistryRoleRepository } from "@/modules/members/application/ports/IMemberMinistryRoleRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type {
  GetMemberInput,
  GetMemberOutput,
} from "../dtos/member/GetMemberDTO";

export class GetMember extends BaseUseCase<GetMemberInput, GetMemberOutput> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly memberMinistryRepository: IMemberMinistryRepository,
    private readonly memberMinistryRoleRepository: IMemberMinistryRoleRepository,
    private readonly memberAvailabilityRepository: IMemberAvailabilityRepository,
    private readonly churchRepository: IChurchRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
  ) {
    super();
  }

  async execute(input: GetMemberInput): Promise<Result<GetMemberOutput>> {
    try {
      const member = await this.memberRepository.findById(input.memberId);

      if (!member) {
        return {
          ok: false,
          error: {
            code: "MEMBER_NOT_FOUND",
            message: "Membro não encontrado",
          },
        };
      }

      const [memberChurches, memberMinistries, memberMinistryRoles] =
        await Promise.all([
          this.memberChurchRepository.findByMemberId(input.memberId),
          this.memberMinistryRepository.findByMemberId(input.memberId),
          this.memberMinistryRoleRepository.findByMemberId(input.memberId),
        ]);

      const userChurchMap = new Map(
        (input.userChurches ?? []).map((uc) => [uc.churchId, uc]),
      );

      const activeRoleIdsByMinistry = new Map<string, Set<string>>();
      const ministryIds = [
        ...new Set(memberMinistries.map((ministry) => ministry.ministryId)),
      ];
      const activeRoles = await Promise.all(
        ministryIds.map((ministryId) =>
          this.ministryRoleRepository.findByMinistryId(ministryId),
        ),
      );
      ministryIds.forEach((ministryId, index) => {
        activeRoleIdsByMinistry.set(
          ministryId,
          new Set(activeRoles[index].map((role) => role.id)),
        );
      });

      const ministryIdsByChurch = new Map<string, string[]>();
      for (const mm of memberMinistries) {
        const existing = ministryIdsByChurch.get(mm.churchId) ?? [];
        existing.push(mm.ministryId);
        ministryIdsByChurch.set(mm.churchId, existing);
      }

      const ministryRoleIdsByChurch = new Map<string, Map<string, string[]>>();
      for (const assignment of memberMinistryRoles) {
        if (
          !activeRoleIdsByMinistry
            .get(assignment.ministryId)
            ?.has(assignment.ministryRoleId)
        ) {
          continue;
        }
        const churchAssignments =
          ministryRoleIdsByChurch.get(assignment.churchId) ?? new Map();
        const roleIds = churchAssignments.get(assignment.ministryId) ?? [];
        roleIds.push(assignment.ministryRoleId);
        churchAssignments.set(assignment.ministryId, roleIds);
        ministryRoleIdsByChurch.set(assignment.churchId, churchAssignments);
      }

      const churchesWithPermission = await Promise.all(
        memberChurches.map(async (mc) => {
          const userChurch = userChurchMap.get(mc.churchId);
          const church = await this.churchRepository.findById(mc.churchId);
          const role = mc.roleId
            ? await this.roleRepository.findById(mc.roleId)
            : null;

          let userPermission: "write" | "read" | null = null;

          if (input.isSuperAdmin) {
            userPermission = "write";
          } else if (userChurch) {
            if (userChurch.hasMemberWrite) {
              userPermission = "write";
            } else if (userChurch.hasMemberRead) {
              userPermission = "read";
            }
          }

          return {
            churchId: mc.churchId,
            churchName: church?.name ?? "Igreja não encontrada",
            roleId: mc.roleId ?? "",
            roleName: role?.name ?? "Cargo do sistema não encontrado",
            userPermission,
            ministryIds: ministryIdsByChurch.get(mc.churchId) ?? [],
            ministryRoleIdsByMinistry: Array.from(
              ministryRoleIdsByChurch.get(mc.churchId)?.entries() ?? [],
            ).map(([ministryId, ministryRoleIds]) => ({
              ministryId,
              ministryRoleIds,
            })),
          };
        }),
      );

      let visibleChurches = churchesWithPermission.filter(
        (c) => c.userPermission !== null,
      );

      if (input.isSuperAdmin) {
        visibleChurches = churchesWithPermission;
      }

      const memberAvailability =
        await this.memberAvailabilityRepository.findByMemberId(input.memberId);

      return {
        ok: true,
        value: {
          id: member.id,
          email: member.email,
          fullName: member.fullName,
          phone: member.phone,
          status: member.status,
          avatarUrl: member.avatarUrl,
          availability: memberAvailability
            ? {
                daysOfWeek: memberAvailability.daysOfWeek,
              }
            : null,
          churches: visibleChurches,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "GET_MEMBER_FAILED",
          message: "Falha ao buscar membro",
        },
      };
    }
  }
}
