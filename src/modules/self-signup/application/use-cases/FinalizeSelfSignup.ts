import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IGoogleAuthService } from "@/modules/identity/application/ports/IGoogleAuthService";
import type { ILegalConsentRepository } from "@/modules/identity/application/ports/ILegalConsentRepository";
import type { IUserRepository } from "@/modules/identity/application/ports/IUserRepository";
import {
  LegalConsent,
  type LegalConsentParams,
} from "@/modules/identity/domain/entities/LegalConsent";
import { User, type UserParams } from "@/modules/identity/domain/entities/User";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import {
  MemberChurch,
  type MemberChurchParams,
} from "@/modules/members/domain/entities/MemberChurch";
import {
  MemberMinistry,
  type MemberMinistryParams,
} from "@/modules/members/domain/entities/MemberMinistry";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import type {
  FinalizeSelfSignupInputDTO,
  FinalizeSelfSignupOutputDTO,
} from "@/modules/self-signup/application/dtos/FinalizeSelfSignupDTO";
import { SelfSignupErrors } from "@/modules/self-signup/application/errors/SelfSignupErrors";
import {
  PRIVACY_POLICY_VERSION,
  TERMS_OF_USE_VERSION,
} from "@/shared/constants/legal";
import type { Result } from "@/shared/types/Result";
import { normalizePhone } from "@/shared/utils/phone";
import { BaseUseCase } from "../BaseUseCase";
import { resolveSelfSignupRoleId } from "./helpers/resolveSelfSignupRoleId";
import {
  type SaveSelfSignupMemberFormRepositories,
  saveSelfSignupMemberForm,
} from "./helpers/saveSelfSignupMemberForm";
import { upsertSelfSignupMember } from "./helpers/upsertSelfSignupMember";

export interface FinalizeSelfSignupInput extends FinalizeSelfSignupInputDTO {
  churchId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
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
    private readonly memberMinistryRepository: IMemberMinistryRepository,
    private readonly ministryRepository: IMinistryRepository,
    private readonly userRepository: IUserRepository,
    private readonly legalConsentRepository: ILegalConsentRepository,
    private readonly googleAuthService: IGoogleAuthService,
    private readonly memberFormRepositories: SaveSelfSignupMemberFormRepositories,
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
        input.memberForm,
      );

      const user = await this.ensureUser(member.id);
      await this.ensureMemberChurch(member.id, church.id, roleId);
      await saveSelfSignupMemberForm(this.memberFormRepositories, {
        memberId: member.id,
        churchId: church.id,
        memberForm: input.memberForm,
      });
      await this.ensureMemberMinistries(
        member.id,
        church.id,
        input.ministryIds,
      );
      await this.registerLegalConsent(member.id, user.id, church.id, input);

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

  private async ensureMemberMinistries(
    memberId: string,
    churchId: string,
    ministryIds: string[],
  ): Promise<void> {
    if (ministryIds.length === 0) return;

    const validMinistries =
      await this.ministryRepository.findByChurchId(churchId);
    const validIds = new Set(validMinistries.map((m) => m.id));
    const invalidIds = ministryIds.filter((id) => !validIds.has(id));

    if (invalidIds.length > 0) {
      throw new Error(SelfSignupErrors.INVALID_MINISTRIES.message);
    }

    const now = new Date();

    for (const ministryId of ministryIds) {
      const existing =
        await this.memberMinistryRepository.findByMemberAndMinistry(
          memberId,
          ministryId,
        );

      if (existing) continue;

      const params: MemberMinistryParams = {
        memberId,
        churchId,
        ministryId,
        createdAt: now,
        updatedAt: now,
      };

      await this.memberMinistryRepository.create(new MemberMinistry(params));
    }
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

  private async registerLegalConsent(
    memberId: string,
    userId: string,
    churchId: string,
    input: FinalizeSelfSignupInput,
  ): Promise<void> {
    const now = new Date();

    const params: LegalConsentParams = {
      memberId,
      userId,
      churchId,
      termsVersion: TERMS_OF_USE_VERSION,
      privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      acceptedAt: now,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      source: "self-signup",
      createdAt: now,
      updatedAt: now,
    };

    await this.legalConsentRepository.create(new LegalConsent(params));
  }
}
