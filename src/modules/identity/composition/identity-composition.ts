import { validateSession } from "@/app/api/_lib/auth";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import { GoogleAuthFirebaseService } from "@/infra/firebase-admin/services/GoogleAuthFirebaseService";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";
import { ChurchDrizzleRepository } from "@/modules/churches/infrastructure/persistence/drizzle/ChurchDrizzleRepository";
import { AuthLoginUseCase } from "@/modules/identity/application/use-cases/AuthLoginUseCase";
import { UserDrizzleRepository } from "@/modules/identity/infrastructure/persistence/drizzle/UserDrizzleRepository";
import { createIdentityHandlers } from "@/modules/identity/presentation/http/handlers/identity-handlers";
import { createLoginHandler } from "@/modules/identity/presentation/http/handlers/login-handler";
import { MemberChurchDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberChurchDrizzleRepository";
import { MemberDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberDrizzleRepository";
import { RolePermissionDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RolePermissionDrizzleRepository";

export function createIdentityComposition() {
  const tokenService = new JoseTokenJwtService();
  const database = getDatabaseClient();
  const churchRepository = new ChurchDrizzleRepository(database);
  const memberRepository = new MemberDrizzleRepository(database);
  const memberChurchRepository = new MemberChurchDrizzleRepository(database);
  const rolePermissionRepository = new RolePermissionDrizzleRepository(database);
  const authLoginUseCase = new AuthLoginUseCase(
    new GoogleAuthFirebaseService(),
    tokenService,
    new UserDrizzleRepository(database),
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
