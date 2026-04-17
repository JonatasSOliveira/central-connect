import { Church, type ChurchParams } from "@/domain/entities/Church";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import type { Result } from "@/shared/types/Result";
import { ChurchErrors } from "../../errors/ChurchErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface UpdateChurchInput {
  churchId: string;
  name: string;
  selfSignupDefaultRoleId?: string;
  updatedByUserId: string;
}

export interface UpdateChurchOutput {
  church: Church;
}

export class UpdateChurch extends BaseUseCase<
  UpdateChurchInput,
  UpdateChurchOutput
> {
  constructor(
    private readonly churchRepository: IChurchRepository,
    private readonly roleRepository: IRoleRepository,
  ) {
    super();
  }

  async execute(input: UpdateChurchInput): Promise<Result<UpdateChurchOutput>> {
    try {
      const existingChurch = await this.churchRepository.findById(
        input.churchId,
      );

      if (!existingChurch) {
        return {
          ok: false,
          error: ChurchErrors.CHURCH_NOT_FOUND,
        };
      }

      const selfSignupDefaultRoleId =
        input.selfSignupDefaultRoleId === undefined
          ? existingChurch.selfSignupDefaultRoleId
          : input.selfSignupDefaultRoleId.trim() || null;

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
        id: existingChurch.id,
        name: input.name,
        selfSignupDefaultRoleId,
        createdByUserId: existingChurch.createdByUserId ?? null,
        createdAt: existingChurch.createdAt,
        updatedAt: new Date(),
        updatedByUserId: input.updatedByUserId,
      };

      const updatedChurch = new Church(churchParams);
      const result = await this.churchRepository.update(updatedChurch);

      return {
        ok: true,
        value: {
          church: result,
        },
      };
    } catch {
      return {
        ok: false,
        error: ChurchErrors.CHURCH_UPDATE_FAILED,
      };
    }
  }
}
