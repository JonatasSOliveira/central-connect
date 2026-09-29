import { validateSession } from "@/shared/presentation/http/auth";
import { AuthLoginUseCase } from "@/modules/identity/application/use-cases/AuthLoginUseCase";
import { RefreshSessionUseCase } from "@/modules/identity/application/use-cases/RefreshSessionUseCase";
import type { IGoogleAuthService } from "@/modules/identity/application/ports/IGoogleAuthService";
import type { ITokenService } from "@/modules/identity/application/ports/ITokenService";
import type { IUserRepository } from "@/modules/identity/application/ports/IUserRepository";
import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import { createIdentityHandlers } from "@/modules/identity/presentation/http/handlers/identity-handlers";
import { createLoginHandler } from "@/modules/identity/presentation/http/handlers/login-handler";

export function createIdentityComposition(externalDependencies: {
  churchRepository: IChurchRepository;
  memberRepository: IMemberRepository;
  memberChurchRepository: IMemberChurchRepository;
  rolePermissionRepository: IRolePermissionRepository;
  googleAuthService: IGoogleAuthService;
  tokenService: ITokenService;
  userRepository: IUserRepository;
}) {
  const authLoginUseCase = new AuthLoginUseCase(
    externalDependencies.googleAuthService,
    externalDependencies.tokenService,
    externalDependencies.userRepository,
    externalDependencies.memberRepository,
    externalDependencies.memberChurchRepository,
    externalDependencies.rolePermissionRepository,
    externalDependencies.churchRepository,
  );
  const refreshSessionUseCase = new RefreshSessionUseCase(
    externalDependencies.churchRepository,
    externalDependencies.memberChurchRepository,
    externalDependencies.rolePermissionRepository,
    externalDependencies.tokenService,
  );
  const handlerDependencies = {
    authLoginUseCase,
    refreshSessionUseCase,
    tokenService: externalDependencies.tokenService,
    churchRepository: externalDependencies.churchRepository,
    memberChurchRepository: externalDependencies.memberChurchRepository,
    rolePermissionRepository: externalDependencies.rolePermissionRepository,
  };
  return {
    httpHandlers: {
      login: createLoginHandler(handlerDependencies),
      ...createIdentityHandlers(handlerDependencies, validateSession),
    },
  };
}

export type IdentityComposition = ReturnType<typeof createIdentityComposition>;
