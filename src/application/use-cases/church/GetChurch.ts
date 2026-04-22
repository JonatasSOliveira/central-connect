import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { Result } from "@/shared/types/Result";
import { ChurchErrors } from "../../errors/ChurchErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface GetChurchInput {
  churchId: string;
}

export interface GetChurchOutput {
  church: {
    id: string;
    name: string;
    selfSignupDefaultRoleId: string | null;
    maxConsecutiveScalesPerMember: number;
  };
}

export class GetChurch extends BaseUseCase<GetChurchInput, GetChurchOutput> {
  constructor(private readonly churchRepository: IChurchRepository) {
    super();
  }

  async execute(input: GetChurchInput): Promise<Result<GetChurchOutput>> {
    try {
      const church = await this.churchRepository.findById(input.churchId);

      if (!church) {
        return {
          ok: false,
          error: ChurchErrors.CHURCH_NOT_FOUND,
        };
      }

      return {
        ok: true,
        value: {
          church: {
            id: church.id,
            name: church.name,
            selfSignupDefaultRoleId: church.selfSignupDefaultRoleId,
            maxConsecutiveScalesPerMember:
              church.maxConsecutiveScalesPerMember,
          },
        },
      };
    } catch {
      return {
        ok: false,
        error: ChurchErrors.CHURCH_NOT_FOUND,
      };
    }
  }
}
