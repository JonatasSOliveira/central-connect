import { Church, type ChurchParams } from "@/domain/entities/Church";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
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
