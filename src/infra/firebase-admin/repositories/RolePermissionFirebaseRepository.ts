import type { DocumentData } from "firebase-admin/firestore";
import type { RolePermission } from "@/domain/entities/RolePermission";
import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import { getFirestoreDb } from "../firebaseConfig";
import {
  rolePermissionFromPersistence,
  rolePermissionToCompositeId,
  rolePermissionToPersistence,
} from "../mappers/roleMapper";

export class RolePermissionFirebaseRepository
  implements IRolePermissionRepository
{
  private readonly collection = "roles";

  private getRolePermissionsCollection(roleId: string) {
    return getFirestoreDb()
      .collection(this.collection)
      .doc(roleId)
      .collection("permissions");
  }

  async create(rolePermission: RolePermission): Promise<RolePermission> {
    const compositeId = rolePermissionToCompositeId(
      rolePermission.userRoleId,
      rolePermission.permission,
    );

    const docRef = this.getRolePermissionsCollection(
      rolePermission.userRoleId,
    ).doc(compositeId);

    await docRef.set(rolePermissionToPersistence(rolePermission));

    return rolePermission;
  }

  async createMany(rolePermissions: RolePermission[]): Promise<void> {
    const batch = getFirestoreDb().batch();

    for (const rolePermission of rolePermissions) {
      const compositeId = rolePermissionToCompositeId(
        rolePermission.userRoleId,
        rolePermission.permission,
      );

      const docRef = this.getRolePermissionsCollection(
        rolePermission.userRoleId,
      ).doc(compositeId);

      batch.set(docRef, rolePermissionToPersistence(rolePermission));
    }

    await batch.commit();
  }

  async findByRoleId(roleId: string): Promise<RolePermission[]> {
    const snapshot = await this.getRolePermissionsCollection(roleId).get();

    return snapshot.docs.map((doc) =>
      rolePermissionFromPersistence(doc.data() as DocumentData, doc.id),
    );
  }

  async findByPermission(permission: string): Promise<RolePermission[]> {
    const rolesSnapshot = await getFirestoreDb()
      .collection(this.collection)
      .get();

    const allPermissions: RolePermission[] = [];

    for (const roleDoc of rolesSnapshot.docs) {
      const permSnapshot = await roleDoc.ref
        .collection("permissions")
        .where("permission", "==", permission)
        .get();

      for (const permDoc of permSnapshot.docs) {
        allPermissions.push(
          rolePermissionFromPersistence(
            permDoc.data() as DocumentData,
            permDoc.id,
          ),
        );
      }
    }

    return allPermissions;
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    const snapshot = await this.getRolePermissionsCollection(roleId).get();

    const batch = getFirestoreDb().batch();
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
    }

    await batch.commit();
  }

  async deleteByRoleIdAndPermission(
    roleId: string,
    permission: string,
  ): Promise<void> {
    const compositeId = rolePermissionToCompositeId(roleId, permission);
    await this.getRolePermissionsCollection(roleId).doc(compositeId).delete();
  }
}
