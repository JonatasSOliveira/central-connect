import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";

export async function resolveSelfSignupRoleId(
  roleRepository: IRoleRepository,
  rolePermissionRepository: IRolePermissionRepository,
  configuredRoleId: string | null,
): Promise<string | null> {
  if (configuredRoleId) {
    const role = await roleRepository.findById(configuredRoleId);
    return role?.id ?? null;
  }

  const roles = await roleRepository.findAll();
  if (roles.length === 0) return null;

  const roleScores = await Promise.all(
    roles.map(async (role) => {
      const permissions = await rolePermissionRepository.findByRoleId(role.id);
      return {
        roleId: role.id,
        name: role.name,
        score: permissions.length,
      };
    }),
  );

  roleScores.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.name.localeCompare(b.name);
  });

  return roleScores[0]?.roleId ?? null;
}
