import { Member, type MemberParams } from "@/domain/entities/Member";
import { User, type UserParams } from "@/domain/entities/User";
import type { IGoogleAuthService } from "@/domain/ports/IGoogleAuthService";
import type { IInviteRepository } from "@/domain/ports/IInviteRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { ITokenService } from "@/domain/ports/ITokenService";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import type { Result } from "@/shared/types/Result";
import type { AuthLoginInputDTO } from "../../dtos/auth/AuthLoginInputDTO";
import type { AuthLoginOutputDTO } from "../../dtos/auth/AuthLoginOutputDTO";
import { AuthErrors } from "../../errors/authErrors";
import { BaseUseCase } from "../BaseUseCase";

export class AuthLoginUseCase extends BaseUseCase<
  AuthLoginInputDTO,
  AuthLoginOutputDTO
> {
  constructor(
    private readonly googleAuthService: IGoogleAuthService,
    private readonly tokenService: ITokenService,
    private readonly userRepository: IUserRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly inviteRepository: IInviteRepository,
  ) {
    super();
  }

  async execute(input: AuthLoginInputDTO): Promise<Result<AuthLoginOutputDTO>> {
    try {
      const googleUser = await this.verifyGoogleToken(input.googleToken);
      if (!googleUser.email) {
        return this.buildErrorResponse(AuthErrors.INVALID_GOOGLE_TOKEN);
      }

      const existingUser = await this.userRepository.findByEmail(
        googleUser.email,
      );

      if (existingUser) {
        const member = existingUser.memberId
          ? await this.memberRepository.findById(existingUser.memberId)
          : null;
        return this.buildSuccessResponse(existingUser, member);
      }

      if (this.isSuperAdminEmail(googleUser.email)) {
        const newUser = await this.createUser(googleUser.email, true);
        return this.buildSuccessResponse(newUser);
      }

      const invite = await this.inviteRepository.findByEmail(googleUser.email);
      if (!invite) {
        return this.buildErrorResponse(AuthErrors.NO_INVITE_FOUND);
      }

      const newUser = await this.createUserWithInvite(
        googleUser.email,
        googleUser.name,
        googleUser.picture,
        invite.churchId,
        invite.roleId,
      );

      await this.inviteRepository.markAsUsed(invite.id);

      const member = await this.memberRepository.findById(newUser.memberId!);
      return this.buildSuccessResponse(newUser, member);
    } catch {
      return this.buildErrorResponse(AuthErrors.INTERNAL_ERROR);
    }
  }

  private async verifyGoogleToken(googleToken: string) {
    return this.googleAuthService.verifyGoogleToken(googleToken);
  }

  private async buildSuccessResponse(
    user: User,
    member?: Member | null,
  ): Promise<Result<AuthLoginOutputDTO>> {
    const token = await this.generateTokenForUser(user);

    return {
      ok: true,
      value: {
        token,
        userId: user.id,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        fullName: member?.fullName ?? null,
        avatarUrl: member?.avatarUrl ?? null,
      },
    };
  }

  private buildErrorResponse(
    error: (typeof AuthErrors)[keyof typeof AuthErrors],
  ): Result<AuthLoginOutputDTO> {
    return { ok: false, error };
  }

  private async generateTokenForUser(user: User): Promise<string> {
    return this.tokenService.generateToken(user.id, user.email!);
  }

  private isSuperAdminEmail(email: string): boolean {
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") ?? [];
    return superAdminEmails.includes(email);
  }

  private async createUser(
    email: string,
    isSuperAdmin: boolean,
  ): Promise<User> {
    const userParams: UserParams = {
      email,
      isSuperAdmin,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = new User(userParams);
    return this.userRepository.create(user);
  }

  private async createUserWithInvite(
    email: string,
    googleName: string | undefined,
    googlePicture: string | undefined,
    churchId: string,
    roleId: string,
  ): Promise<User> {
    const memberParams: MemberParams = {
      fullName: googleName ?? "",
      avatarUrl: googlePicture ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const member = new Member(memberParams);
    const createdMember = await this.memberRepository.create(member);

    const userParams: UserParams = {
      email,
      memberId: createdMember.id,
      churchId,
      userRoleId: roleId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = new User(userParams);
    return this.userRepository.create(user);
  }
}
