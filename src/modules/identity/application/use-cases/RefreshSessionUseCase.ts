import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { ITokenService } from "@/modules/identity/application/ports/ITokenService";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import type { SessionPayload } from "@/shared/contracts/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import type { Result } from "@/shared/types/Result";

interface RefreshSessionOutput {
  session: SessionPayload;
  sessionToken: string;
}

export class RefreshSessionUseCase {
  constructor(
    private readonly churchRepository: IChurchRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(
    currentSession: SessionPayload,
  ): Promise<Result<RefreshSessionOutput>> {
    const churches = currentSession.isSuperAdmin
      ? (await this.churchRepository.findAll()).map((church) => ({
          churchId: church.id,
          roleId: null,
        }))
      : (
          await this.memberChurchRepository.findByMemberId(
            currentSession.memberId,
          )
        ).map((memberChurch) => ({
          churchId: memberChurch.churchId,
          roleId: memberChurch.roleId,
        }));

    const currentChurchIsAvailable = currentSession.churchId
      ? churches.some((church) => church.churchId === currentSession.churchId)
      : false;
    const churchId = currentChurchIsAvailable
      ? currentSession.churchId
      : churches.length === 1
        ? churches[0].churchId
        : null;
    const church = churchId
      ? await this.churchRepository.findById(churchId)
      : null;
    const permissions = await this.getPermissions(
      churchId,
      churches,
      currentSession,
    );
    const session: SessionPayload = {
      ...currentSession,
      churchId,
      churchName: church?.name ?? null,
      churches,
      permissions,
    };
    const sessionToken = await this.tokenService.generateToken(
      session as unknown as Record<string, unknown>,
    );

    return { ok: true, value: { session, sessionToken } };
  }

  private async getPermissions(
    churchId: string | null,
    churches: SessionPayload["churches"],
    session: SessionPayload,
  ): Promise<string[]> {
    if (session.isSuperAdmin) {
      return Object.values(Permission);
    }

    if (!churchId) {
      return [];
    }

    const selectedChurch = churches.find(
      (church) => church.churchId === churchId,
    );
    if (!selectedChurch?.roleId) {
      return [];
    }

    return (
      await this.rolePermissionRepository.findByRoleId(selectedChurch.roleId)
    ).map((item) => item.permission);
  }
}
