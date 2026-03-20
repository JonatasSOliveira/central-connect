import type { DocumentData } from "firebase-admin/firestore";
import { Invite, type InviteParams } from "@/domain/entities/Invite";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function inviteToPersistence(invite: Invite): DocumentData {
  return convertDatesToTimestamps({
    email: invite.email,
    roleId: invite.roleId,
    churchId: invite.churchId,
    isUsed: invite.isUsed,
    usedAt: invite.usedAt,
    createdAt: invite.createdAt,
    updatedAt: invite.updatedAt,
  });
}

export function inviteFromPersistence(data: DocumentData, id: string): Invite {
  const convertedData = convertTimestampsToDates(data);
  const params: InviteParams = {
    id,
    email: convertedData.email ?? "",
    roleId: convertedData.roleId ?? "",
    churchId: convertedData.churchId ?? "",
    isUsed: convertedData.isUsed ?? false,
    usedAt: convertedData.usedAt ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new Invite(params);
}
