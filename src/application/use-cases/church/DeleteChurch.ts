import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { Result } from "@/shared/types/Result";
import { ChurchErrors } from "../../errors/ChurchErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface DeleteChurchInput {
  churchId: string;
}

export class DeleteChurch extends BaseUseCase<DeleteChurchInput, void> {
  constructor(private readonly churchRepository: IChurchRepository) {
    super();
  }

  async execute(input: DeleteChurchInput): Promise<Result<void>> {
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

      await this.churchRepository.delete(input.churchId);

      return {
        ok: true,
        value: undefined,
      };
    } catch {
      return {
        ok: false,
        error: ChurchErrors.CHURCH_DELETION_FAILED,
      };
    }
  }
}
