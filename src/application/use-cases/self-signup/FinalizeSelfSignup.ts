import type {
  FinalizeSelfSignupInputDTO,
  FinalizeSelfSignupOutputDTO,
} from "@/application/dtos/self-signup/FinalizeSelfSignupDTO";
import { SelfSignupErrors } from "@/application/errors/SelfSignupErrors";
import {
  MemberChurch,
  type MemberChurchParams,
} from "@/domain/entities/MemberChurch";
import { User, type UserParams } from "@/domain/entities/User";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IGoogleAuthService } from "@/domain/ports/IGoogleAuthService";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import { normalizePhone } from "@/shared/utils/phone";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import { resolveSelfSignupRoleId } from "./helpers/resolveSelfSignupRoleId";
import { upsertSelfSignupMember } from "./helpers/upsertSelfSignupMember";

export interface FinalizeSelfSignupInput extends FinalizeSelfSignupInputDTO {
  churchId: string;
}

export class FinalizeSelfSignup extends BaseUseCase<
  FinalizeSelfSignupInput,
  FinalizeSelfSignupOutputDTO
> {
  constructor(
    private readonly churchRepository: IChurchRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly userRepository: IUserRepository,
    private readonly googleAuthService: IGoogleAuthService,
  ) {
    super();
  }

  async execute(
    input: FinalizeSelfSignupInput,
  ): Promise<Result<FinalizeSelfSignupOutputDTO>> {
    try {
      const church = await this.churchRepository.findById(input.churchId);
      if (!church) {
        return {
          ok: false,
          error: SelfSignupErrors.CHURCH_NOT_FOUND,
        };
      }

      const roleId = await this.resolveSelfSignupRoleId(
        church.selfSignupDefaultRoleId,
      );

      if (!roleId) {
        return {
          ok: false,
          error: SelfSignupErrors.SELF_SIGNUP_ROLE_NOT_CONFIGURED,
        };
      }

      const googleUser = await this.googleAuthService.verifyGoogleToken(
        input.googleToken,
      );

      if (!googleUser.email) {
        return {
          ok: false,
          error: SelfSignupErrors.INVALID_GOOGLE_TOKEN,
        };
      }

      const phoneNormalized = normalizePhone(input.phone);
      if (phoneNormalized.length < 8) {
        return {
          ok: false,
          error: SelfSignupErrors.INVALID_PHONE,
        };
      }

      const memberByPhone =
        await this.memberRepository.findByNormalizedPhone(phoneNormalized);
      const memberByEmail = await this.memberRepository.findByEmail(
        googleUser.email,
      );

      const targetMember = memberByPhone ?? memberByEmail;
      const fullName =
        input.fullName.trim() || googleUser.name?.trim() || "Novo membro";
      const email = googleUser.email;

      const member = await upsertSelfSignupMember(
        this.memberRepository,
        targetMember,
        fullName,
        input.phone,
        email,
      );

      const user = await this.ensureUser(member.id);
      await this.ensureMemberChurch(member.id, church.id, roleId);

      return {
        ok: true,
        value: {
          memberId: member.id,
          userId: user.id,
          churchId: church.id,
          linked: true,
        },
      };
    } catch {
      return {
        ok: false,
        error: SelfSignupErrors.FINALIZE_FAILED,
      };
    }
  }

  private async resolveSelfSignupRoleId(
    configuredRoleId: string | null,
  ): Promise<string | null> {
    return resolveSelfSignupRoleId(
      this.roleRepository,
      this.rolePermissionRepository,
      configuredRoleId,
    );
  }

  private async ensureUser(memberId: string): Promise<User> {
    const existingUser = await this.userRepository.findByMemberId(memberId);
    if (existingUser) return existingUser;

    const now = new Date();
    const params: UserParams = {
      memberId,
      isActive: true,
      isSuperAdmin: false,
      createdAt: now,
      updatedAt: now,
    };

    return this.userRepository.create(new User(params));
  }

  private async ensureMemberChurch(
    memberId: string,
    churchId: string,
    roleId: string,
  ): Promise<void> {
    const existing =
      await this.memberChurchRepository.findByMemberIdAndChurchId(
        memberId,
        churchId,
      );

    if (existing) {
      return;
    }

    const now = new Date();
    const params: MemberChurchParams = {
      memberId,
      churchId,
      roleId,
      createdAt: now,
      updatedAt: now,
    };

    await this.memberChurchRepository.create(new MemberChurch(params));
  }
}
