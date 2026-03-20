import { Church, type ChurchParams } from "@/domain/entities/Church";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { Result } from "@/shared/types/Result";
import { ChurchErrors } from "../../errors/churchErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface CreateChurchInput {
  name: string;
  createdByUserId: string;
}

export interface CreateChurchOutput {
  church: Church;
}

export class CreateChurch extends BaseUseCase<
  CreateChurchInput,
  CreateChurchOutput
> {
  constructor(private readonly churchRepository: IChurchRepository) {
    super();
  }

  async execute(input: CreateChurchInput): Promise<Result<CreateChurchOutput>> {
    try {
      const churchParams: ChurchParams = {
        name: input.name,
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
