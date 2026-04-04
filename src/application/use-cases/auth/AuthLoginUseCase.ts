import { Member, type MemberParams } from "@/domain/entities/Member";
import { User, type UserParams } from "@/domain/entities/User";
import { Permission } from "@/domain/enums/Permission";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IGoogleAuthService } from "@/domain/ports/IGoogleAuthService";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { ITokenService } from "@/domain/ports/ITokenService";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import type { Result } from "@/shared/types/Result";
import type { AuthLoginInputDTO } from "../../dtos/auth/AuthLoginInputDTO";
import type { AuthLoginOutputDTO } from "../../dtos/auth/AuthLoginOutputDTO";
import { AuthErrors } from "../../errors/AuthErrors";
import { BaseUseCase } from "../BaseUseCase";

interface ChurchInfo {
  churchId: string;
  roleId: string | null;
}

export class AuthLoginUseCase extends BaseUseCase<
  AuthLoginInputDTO,
  AuthLoginOutputDTO
> {
  constructor(
    private readonly googleAuthService: IGoogleAuthService,
    private readonly tokenService: ITokenService,
    private readonly userRepository: IUserRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly churchRepository: IChurchRepository,
  ) {
    super();
  }

  async execute(input: AuthLoginInputDTO): Promise<Result<AuthLoginOutputDTO>> {
    try {
      const googleUser = await this.verifyGoogleToken(input.googleToken);
      if (!googleUser.email) {
        return this.buildErrorResponse(AuthErrors.INVALID_GOOGLE_TOKEN);
      }

      const existingMember = await this.memberRepository.findByEmail(
        googleUser.email,
      );

      if (existingMember) {
        const existingUser = await this.userRepository.findByMemberId(
          existingMember.id,
        );

        if (existingUser) {
          const churches = await this.getMemberChurches(
            existingMember.id,
            existingUser.isSuperAdmin,
          );
          const permissions = await this.getPermissionsForChurches(
            churches,
            existingUser.isSuperAdmin,
          );
          return this.buildSuccessResponse(
            existingUser,
            existingMember,
            churches,
            permissions,
          );
        }

        const newUser = await this.createUser(existingMember.id);
        const churches = await this.getMemberChurches(
          existingMember.id,
          newUser.isSuperAdmin,
        );
        const permissions = await this.getPermissionsForChurches(
          churches,
          newUser.isSuperAdmin,
        );
        return this.buildSuccessResponse(
          newUser,
          existingMember,
          churches,
          permissions,
        );
      }

      if (this.isSuperAdminEmail(googleUser.email)) {
        const newMember = await this.createMember(
          googleUser.email,
          googleUser.name,
          googleUser.picture,
        );
        const newUser = await this.createUser(newMember.id, true);
        const churches = await this.getMemberChurches(newMember.id, true);
        return this.buildSuccessResponse(
          newUser,
          newMember,
          churches,
          this.getAllPermissions(),
        );
      }

      return this.buildErrorResponse(AuthErrors.NO_INVITE_FOUND);
    } catch (error) {
      console.error("[AuthLoginUseCase] Error:", error);
      return this.buildErrorResponse(AuthErrors.INTERNAL_ERROR);
    }
  }

  private async verifyGoogleToken(googleToken: string) {
    return this.googleAuthService.verifyGoogleToken(googleToken);
  }

  private async createMember(
    email: string,
    name: string | undefined,
    picture: string | undefined,
  ): Promise<Member> {
    const memberParams: MemberParams = {
      email,
      fullName: name ?? "",
      avatarUrl: picture ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const member = new Member(memberParams);
    return this.memberRepository.create(member);
  }

  private async createUser(
    memberId: string,
    isSuperAdmin = false,
  ): Promise<User> {
    const userParams: UserParams = {
      memberId,
      isSuperAdmin,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const user = new User(userParams);
    return this.userRepository.create(user);
  }

  private async getMemberChurches(
    memberId: string,
    isSuperAdmin: boolean,
  ): Promise<ChurchInfo[]> {
    if (isSuperAdmin) {
      const allChurches = await this.churchRepository.findAll();
      return allChurches.map((church) => ({
        churchId: church.id,
        roleId: null,
      }));
    }

    const memberChurches =
      await this.memberChurchRepository.findByMemberId(memberId);
    return memberChurches.map((mc) => ({
      churchId: mc.churchId,
      roleId: mc.roleId,
    }));
  }

  private async getPermissionsForChurches(
    churches: ChurchInfo[],
    isSuperAdmin: boolean,
  ): Promise<string[]> {
    if (isSuperAdmin) {
      return this.getAllPermissions();
    }

    const permissionsSet = new Set<string>();

    for (const church of churches) {
      if (church.roleId) {
        const rolePermissions =
          await this.rolePermissionRepository.findByRoleId(church.roleId);
        rolePermissions.forEach((rp) => {
          permissionsSet.add(rp.permission);
        });
      }
    }

    return Array.from(permissionsSet);
  }

  private getAllPermissions(): string[] {
    return Object.values(Permission);
  }

  private async buildSuccessResponse(
    user: User,
    member: Member,
    churches: ChurchInfo[],
    permissions: string[],
  ): Promise<Result<AuthLoginOutputDTO>> {
    const defaultChurchId = churches.length === 1 ? churches[0].churchId : null;

    const sessionPayload = {
      userId: user.id,
      memberId: member.id,
      email: member.email,
      fullName: member.fullName,
      avatarUrl: member.avatarUrl,
      isSuperAdmin: user.isSuperAdmin,
      churchId: defaultChurchId,
      churches,
      permissions,
    };

    const sessionToken = await this.tokenService.generateToken(sessionPayload);

    return {
      ok: true,
      value: {
        userId: user.id,
        memberId: member.id,
        email: member.email ?? "",
        fullName: member.fullName,
        avatarUrl: member.avatarUrl,
        isSuperAdmin: user.isSuperAdmin,
        churchId: defaultChurchId,
        churchName: null,
        churches,
        permissions,
        sessionToken,
      },
    };
  }

  private buildErrorResponse(
    error: (typeof AuthErrors)[keyof typeof AuthErrors],
  ): Result<AuthLoginOutputDTO> {
    return { ok: false, error };
  }

  private isSuperAdminEmail(email: string): boolean {
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") ?? [];
    return superAdminEmails.includes(email);
  }
}
