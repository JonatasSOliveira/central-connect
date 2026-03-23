import type { DocumentData } from "firebase-admin/firestore";
import { Member, type MemberParams } from "@/domain/entities/Member";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberToPersistence(member: Member): DocumentData {
  return convertDatesToTimestamps({
    email: member.email,
    fullName: member.fullName,
    phone: member.phone,
    maxServicesPerMonth: member.maxServicesPerMonth,
    status: member.status,
    avatarUrl: member.avatarUrl,
    birthDate: member.birthDate,
    notes: member.notes,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    deletedAt: member.deletedAt,
  });
}

export function memberFromPersistence(data: DocumentData, id: string): Member {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberParams = {
    id,
    email: convertedData.email ?? "",
    fullName: convertedData.fullName ?? "",
    phone: convertedData.phone ?? null,
    maxServicesPerMonth: convertedData.maxServicesPerMonth ?? 4,
    status: convertedData.status ?? "Active",
    avatarUrl: convertedData.avatarUrl ?? null,
    birthDate: convertedData.birthDate ?? null,
    notes: convertedData.notes ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new Member(params);
}
