import path from "node:path";
import { config } from "dotenv";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import { ChurchDrizzleRepository } from "@/modules/churches/infrastructure/persistence/drizzle/ChurchDrizzleRepository";
import { Church } from "@/modules/churches/domain/entities/Church";
import { MinistryDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryDrizzleRepository";
import { Ministry } from "@/modules/ministries/domain/entities/Ministry";
import { RoleDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RoleDrizzleRepository";
import { RolePermissionDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RolePermissionDrizzleRepository";
import { RolePermission } from "@/modules/roles/domain/entities/RolePermission";
import { UserRole } from "@/modules/roles/domain/entities/UserRole";
import { AllPermissions, Permission } from "@/shared/domain/enums/Permission";

config({ path: path.resolve(process.cwd(), ".env.local") });

const database = getDatabaseClient();
const churchRepository = new ChurchDrizzleRepository(database);
const ministryRepository = new MinistryDrizzleRepository(database);
const roleRepository = new RoleDrizzleRepository(database);
const rolePermissionRepository = new RolePermissionDrizzleRepository(database);

async function ensureRole(
  name: string,
  description: string,
  permissions: string[],
): Promise<UserRole> {
  const existing = await roleRepository.findByName(name);
  if (existing) {
    await rolePermissionRepository.createMany(
      permissions.map(
        (permission) => new RolePermission({ userRoleId: existing.id, permission }),
      ),
    );
    return existing;
  }

  const role = await roleRepository.create(
    new UserRole({ name, description, isSystem: false }),
  );
  await rolePermissionRepository.createMany(
    permissions.map(
      (permission) => new RolePermission({ userRoleId: role.id, permission }),
    ),
  );
  return role;
}

async function ensureChurch(name: string, roleId: string): Promise<Church> {
  const existing = (await churchRepository.findAll()).find(
    (church) => church.name === name,
  );
  if (existing) {
    return existing;
  }

  return churchRepository.create(
    new Church({ name, selfSignupDefaultRoleId: roleId }),
  );
}

async function ensureMinistries(churchId: string): Promise<void> {
  const names = ["Louvor", "Sonorização", "Mídia", "Kids", "Recepção", "Diaconia"];
  for (const name of names) {
    const existing = await ministryRepository.findByChurchIdAndName(
      churchId,
      name,
    );
    if (!existing) {
      await ministryRepository.create(new Ministry({ churchId, name }));
    }
  }
}

async function main(): Promise<void> {
  const memberPermissions = [
    Permission.CHURCH_SELF_READ,
    Permission.MEMBER_SELF_WRITE,
    Permission.MY_SCALES_READ,
    Permission.SCALE_SELF_READ,
    Permission.MINISTRY_READ,
  ];
  const adminRole = await ensureRole(
    "Administrador Local",
    "Acesso administrativo para desenvolvimento local.",
    AllPermissions,
  );
  const memberRole = await ensureRole(
    "Membro",
    "Permissões básicas para membros cadastrados pelo self-signup.",
    memberPermissions,
  );
  const church = await ensureChurch("Igreja Local", memberRole.id);
  await ensureMinistries(church.id);

  console.log("Seed PostgreSQL local concluído.");
  console.log(`Igreja: ${church.name} (${church.id})`);
  console.log(`Role admin: ${adminRole.name} (${adminRole.id})`);
  console.log(`Role self-signup: ${memberRole.name} (${memberRole.id})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
