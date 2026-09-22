import { validateSession } from "@/app/api/_lib/auth";
import { GoogleAuthFirebaseService } from "@/infra/firebase-admin/services/GoogleAuthFirebaseService";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";
import { ChurchFirebaseRepository } from "@/modules/churches/infrastructure/persistence/firebase/ChurchFirebaseRepository";
import { AuthLoginUseCase } from "@/modules/identity/application/use-cases/AuthLoginUseCase";
import { UserFirebaseRepository } from "@/modules/identity/infrastructure/persistence/firebase/UserFirebaseRepository";
import { createIdentityHandlers } from "@/modules/identity/presentation/http/handlers/identity-handlers";
import { createLoginHandler } from "@/modules/identity/presentation/http/handlers/login-handler";
import { MemberChurchFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberChurchFirebaseRepository";
import { MemberFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberFirebaseRepository";
import { RolePermissionFirebaseRepository } from "@/modules/roles/infrastructure/persistence/firebase/RolePermissionFirebaseRepository";

export function createIdentityComposition() {
  const tokenService = new JoseTokenJwtService();
  const churchRepository = new ChurchFirebaseRepository();
  const memberRepository = new MemberFirebaseRepository();
  const memberChurchRepository = new MemberChurchFirebaseRepository();
  const rolePermissionRepository = new RolePermissionFirebaseRepository();
  const authLoginUseCase = new AuthLoginUseCase(
    new GoogleAuthFirebaseService(),
    tokenService,
    new UserFirebaseRepository(),
    memberRepository,
    memberChurchRepository,
    rolePermissionRepository,
    churchRepository,
  );
  const dependencies = {
    authLoginUseCase,
    tokenService,
    churchRepository,
    memberChurchRepository,
    rolePermissionRepository,
  };
  return {
    httpHandlers: {
      login: createLoginHandler(dependencies),
      ...createIdentityHandlers(dependencies, validateSession),
    },
  };
}

export type IdentityComposition = ReturnType<typeof createIdentityComposition>;
