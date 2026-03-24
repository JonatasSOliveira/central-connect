import type { Church } from "@/domain/entities/Church";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { Result } from "@/shared/types/Result";
import { ChurchErrors } from "../../errors/ChurchErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface GetChurchInput {
  churchId: string;
}

export interface GetChurchOutput {
  church: Church;
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
          church,
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
