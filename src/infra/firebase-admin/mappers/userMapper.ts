import type { DocumentData } from "firebase-admin/firestore";
import { User, type UserParams } from "@/domain/entities/User";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function userToPersistence(user: User): DocumentData {
  return convertDatesToTimestamps({
    memberId: user.memberId,
    googleAccessToken: user.googleAccessToken,
    googleRefreshToken: user.googleRefreshToken,
    isActive: user.isActive,
    isSuperAdmin: user.isSuperAdmin,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

export function userFromPersistence(data: DocumentData, id: string): User {
  const convertedData = convertTimestampsToDates(data);
  const params: UserParams = {
    id,
    memberId: convertedData.memberId ?? null,
    googleAccessToken: convertedData.googleAccessToken ?? null,
    googleRefreshToken: convertedData.googleRefreshToken ?? null,
    isActive: convertedData.isActive ?? true,
    isSuperAdmin: convertedData.isSuperAdmin ?? false,
    lastLoginAt: convertedData.lastLoginAt ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new User(params);
}
