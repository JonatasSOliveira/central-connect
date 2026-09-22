import type { IUserRepository } from "@/modules/identity/application/ports/IUserRepository";
import { User, type UserParams } from "@/modules/identity/domain/entities/User";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import { UserErrors } from "../errors/UserErrors";

export interface LinkUserToMemberInput {
  memberId: string;
  isSuperAdmin?: boolean;
}

export interface LinkUserToMemberOutput {
  user: User;
}

export class LinkUserToMember extends BaseUseCase<
  LinkUserToMemberInput,
  LinkUserToMemberOutput
> {
  constructor(private readonly userRepository: IUserRepository) {
    super();
  }

  async execute(
    input: LinkUserToMemberInput,
  ): Promise<Result<LinkUserToMemberOutput>> {
    try {
      const existingUser = await this.userRepository.findByMemberId(
        input.memberId,
      );
      if (existingUser) {
        return {
          ok: false,
          error: UserErrors.USER_ALREADY_EXISTS,
        };
      }

      const userParams: UserParams = {
        memberId: input.memberId,
        isSuperAdmin: input.isSuperAdmin ?? false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = new User(userParams);
      const createdUser = await this.userRepository.create(user);

      return {
        ok: true,
        value: {
          user: createdUser,
        },
      };
    } catch {
      return {
        ok: false,
        error: UserErrors.USER_CREATION_FAILED,
      };
    }
  }
}
