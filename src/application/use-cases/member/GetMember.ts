import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/domain/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import type { Result } from "@/shared/types/Result";
import type {
  GetMemberInput,
  GetMemberOutput,
} from "../../dtos/member/GetMemberDTO";
import { BaseUseCase } from "../BaseUseCase";

export class GetMember extends BaseUseCase<GetMemberInput, GetMemberOutput> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly memberMinistryRepository: IMemberMinistryRepository,
    private readonly churchRepository: IChurchRepository,
    private readonly roleRepository: IRoleRepository,
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

      const [memberChurches, memberMinistries] = await Promise.all([
        this.memberChurchRepository.findByMemberId(input.memberId),
        this.memberMinistryRepository.findByMemberId(input.memberId),
      ]);

      const userChurchMap = new Map(
        (input.userChurches ?? []).map((uc) => [uc.churchId, uc]),
      );

      const ministryIdsByChurch = new Map<string, string[]>();
      for (const mm of memberMinistries) {
        const existing = ministryIdsByChurch.get(mm.churchId) ?? [];
        existing.push(mm.ministryId);
        ministryIdsByChurch.set(mm.churchId, existing);
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
          };
        }),
      );

      let visibleChurches = churchesWithPermission.filter(
        (c) => c.userPermission !== null,
      );

      if (input.isSuperAdmin) {
        visibleChurches = churchesWithPermission;
      }

      return {
        ok: true,
        value: {
          id: member.id,
          email: member.email,
          fullName: member.fullName,
          phone: member.phone,
          status: member.status,
          avatarUrl: member.avatarUrl,
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
