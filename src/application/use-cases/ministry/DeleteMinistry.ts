import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/domain/ports/IMinistryRoleRepository";
import type { Result } from "@/shared/types/Result";
import { MinistryErrors } from "../../errors/MinistryErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface DeleteMinistryInput {
  ministryId: string;
}

export class DeleteMinistry extends BaseUseCase<DeleteMinistryInput, void> {
  constructor(
    private readonly ministryRepository: IMinistryRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
  ) {
    super();
  }

  async execute(input: DeleteMinistryInput): Promise<Result<void>> {
    try {
      const existingMinistry = await this.ministryRepository.findById(
        input.ministryId,
      );

      if (!existingMinistry) {
        return {
          ok: false,
          error: MinistryErrors.MINISTRY_NOT_FOUND,
        };
      }

      const roles = await this.ministryRoleRepository.findByMinistryId(
        input.ministryId,
      );

      for (const role of roles) {
        await this.ministryRoleRepository.delete(role.id);
      }

      await this.ministryRepository.delete(input.ministryId);

      return {
        ok: true,
        value: undefined,
      };
    } catch {
      return {
        ok: false,
        error: MinistryErrors.MINISTRY_DELETION_FAILED,
      };
    }
  }
}
