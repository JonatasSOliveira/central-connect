process.env.FIREBASE_USE_EMULATORS ??= "true";
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??= "central-connect-local";

async function main(): Promise<void> {
  const [{ Church }, { Ministry }, { RolePermission }, { UserRole }] =
    await Promise.all([
      import("@/domain/entities/Church"),
      import("@/domain/entities/Ministry"),
      import("@/domain/entities/RolePermission"),
      import("@/domain/entities/UserRole"),
    ]);
  const { AllPermissions, Permission } =
    await import("@/domain/enums/Permission");
  const { ChurchFirebaseRepository } =
    await import("@/infra/firebase-admin/repositories/ChurchFirebaseRepository");
  const { MinistryFirebaseRepository } =
    await import("@/infra/firebase-admin/repositories/MinistryFirebaseRepository");
  const { RoleFirebaseRepository } =
    await import("@/infra/firebase-admin/repositories/RoleFirebaseRepository");
  const { RolePermissionFirebaseRepository } =
    await import("@/infra/firebase-admin/repositories/RolePermissionFirebaseRepository");

  const churchRepository = new ChurchFirebaseRepository();
  const ministryRepository = new MinistryFirebaseRepository();
  const roleRepository = new RoleFirebaseRepository();
  const rolePermissionRepository = new RolePermissionFirebaseRepository();

  async function ensureRole(
    name: string,
    description: string,
    permissions: string[],
  ): Promise<InstanceType<typeof UserRole>> {
    const existing = await roleRepository.findByName(name);
    if (existing) {
      await rolePermissionRepository.createMany(
        permissions.map(
          (permission) =>
            new RolePermission({ userRoleId: existing.id, permission }),
        ),
      );
      return existing;
    }

    const now = new Date();
    const role = await roleRepository.create(
      new UserRole({
        name,
        description,
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      }),
    );

    await rolePermissionRepository.createMany(
      permissions.map(
        (permission) => new RolePermission({ userRoleId: role.id, permission }),
      ),
    );

    return role;
  }

  async function ensureChurch(
    name: string,
    selfSignupDefaultRoleId: string,
  ): Promise<InstanceType<typeof Church>> {
    const churches = await churchRepository.findAll();
    const existing = churches.find((church) => church.name === name);

    if (!existing) {
      const now = new Date();
      return churchRepository.create(
        new Church({
          name,
          selfSignupDefaultRoleId,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }

    if (existing.selfSignupDefaultRoleId === selfSignupDefaultRoleId) {
      return existing;
    }

    return churchRepository.update(
      new Church({
        id: existing.id,
        name: existing.name,
        selfSignupDefaultRoleId,
        maxConsecutiveScalesPerMember: existing.maxConsecutiveScalesPerMember,
        createdAt: existing.createdAt,
        updatedAt: new Date(),
        deletedAt: existing.deletedAt,
      }),
    );
  }

  async function ensureMinistries(churchId: string): Promise<void> {
    const ministryNames = [
      "Louvor",
      "Sonorizacao",
      "Midia",
      "Kids",
      "Recepcao",
      "Diaconia",
    ];
    const now = new Date();

    for (const name of ministryNames) {
      const existing = await ministryRepository.findByChurchIdAndName(
        churchId,
        name,
      );
      if (existing) continue;

      await ministryRepository.create(
        new Ministry({
          churchId,
          name,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }
  }

  const memberPermissions = [
    Permission.CHURCH_SELF_READ,
    Permission.MEMBER_SELF_WRITE,
    Permission.MY_SCALES_READ,
    Permission.SCALE_SELF_READ,
    Permission.MINISTRY_READ,
  ];

  const adminPermissions = AllPermissions;

  const adminRole = await ensureRole(
    "Administrador Local",
    "Acesso administrativo para desenvolvimento local.",
    adminPermissions,
  );
  const memberRole = await ensureRole(
    "Membro",
    "Permissoes basicas para membros cadastrados pelo self-signup.",
    memberPermissions,
  );
  const church = await ensureChurch("Igreja Local", memberRole.id);
  await ensureMinistries(church.id);

  console.log("Firebase local seed concluido.");
  console.log(`Projeto: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
  console.log(`Igreja: ${church.name} (${church.id})`);
  console.log(`Role admin: ${adminRole.name} (${adminRole.id})`);
  console.log(`Role self-signup: ${memberRole.name} (${memberRole.id})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
