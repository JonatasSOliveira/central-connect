import type { DocumentData } from "firebase-admin/firestore";
import {
  RolePermission,
  type RolePermissionParams,
} from "@/domain/entities/RolePermission";
import { UserRole, type UserRoleParams } from "@/domain/entities/UserRole";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function roleToPersistence(role: UserRole): DocumentData {
  return convertDatesToTimestamps({
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    deletedAt: role.deletedAt,
  });
}

export function roleFromPersistence(data: DocumentData, id: string): UserRole {
  const convertedData = convertTimestampsToDates(data);
  const params: UserRoleParams = {
    id,
    name: convertedData.name ?? "",
    description: convertedData.description ?? null,
    isSystem: convertedData.isSystem ?? false,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new UserRole(params);
}

export function rolePermissionToPersistence(
  rolePermission: RolePermission,
): DocumentData {
  return {
    userRoleId: rolePermission.userRoleId,
    permission: rolePermission.permission,
  };
}

export function rolePermissionFromPersistence(
  data: DocumentData,
  _id: string,
): RolePermission {
  const params: RolePermissionParams = {
    userRoleId: data.userRoleId ?? "",
    permission: data.permission ?? "",
  };
  return new RolePermission(params);
}

export function rolePermissionToCompositeId(
  userRoleId: string,
  permission: string,
): string {
  return `${userRoleId}:${permission}`;
}
