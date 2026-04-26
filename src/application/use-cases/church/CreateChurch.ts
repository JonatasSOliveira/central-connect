import { Church, type ChurchParams } from "@/domain/entities/Church";
import { MemberChurch, type MemberChurchParams } from "@/domain/entities/MemberChurch";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import { DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER } from "@/shared/constants/scaleRules";
import type { Result } from "@/shared/types/Result";
import { ChurchErrors } from "../../errors/ChurchErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface CreateChurchInput {
  name: string;
  selfSignupDefaultRoleId?: string;
  maxConsecutiveScalesPerMember?: number;
  createdByUserId: string;
  creatorMemberId?: string;
  creatorRoleId?: string | null;
  isSuperAdmin?: boolean;
}

export interface CreateChurchOutput {
  church: Church;
}

export class CreateChurch extends BaseUseCase<
  CreateChurchInput,
  CreateChurchOutput
> {
  constructor(
    private readonly churchRepository: IChurchRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
  ) {
    super();
  }

  async execute(input: CreateChurchInput): Promise<Result<CreateChurchOutput>> {
    try {
      const selfSignupDefaultRoleId =
        input.selfSignupDefaultRoleId?.trim() || null;

      if (selfSignupDefaultRoleId) {
        const role = await this.roleRepository.findById(
          selfSignupDefaultRoleId,
        );
        if (!role) {
          return {
            ok: false,
            error: ChurchErrors.INVALID_SELF_SIGNUP_ROLE,
          };
        }
      }

      const churchParams: ChurchParams = {
        name: input.name,
        selfSignupDefaultRoleId,
        maxConsecutiveScalesPerMember:
          input.maxConsecutiveScalesPerMember ??
          DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER,
        createdByUserId: input.createdByUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const church = new Church(churchParams);
      const createdChurch = await this.churchRepository.create(church);

      const shouldLinkCreatorToChurch =
        !input.isSuperAdmin &&
        Boolean(input.creatorMemberId) &&
        Boolean(input.creatorRoleId);

      if (shouldLinkCreatorToChurch) {
        const memberChurchParams: MemberChurchParams = {
          memberId: input.creatorMemberId as string,
          churchId: createdChurch.id,
          roleId: input.creatorRoleId ?? null,
          createdByUserId: input.createdByUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const memberChurch = new MemberChurch(memberChurchParams);
        await this.memberChurchRepository.create(memberChurch);
      }

      return {
        ok: true,
        value: {
          church: createdChurch,
        },
      };
    } catch {
      return {
        ok: false,
        error: ChurchErrors.CHURCH_CREATION_FAILED,
      };
    }
  }
}
