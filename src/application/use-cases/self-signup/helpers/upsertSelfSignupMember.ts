import { Member, type MemberParams } from "@/domain/entities/Member";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";

export async function upsertSelfSignupMember(
  memberRepository: IMemberRepository,
  targetMember: Member | null,
  fullName: string,
  phone: string,
  email: string,
): Promise<Member> {
  if (!targetMember) {
    const now = new Date();
    const params: MemberParams = {
      fullName,
      phone,
      email,
      createdAt: now,
      updatedAt: now,
    };

    return memberRepository.create(new Member(params));
  }

  const params: MemberParams = {
    id: targetMember.id,
    email,
    fullName,
    phone,
    maxServicesPerMonth: targetMember.maxServicesPerMonth,
    status: targetMember.status,
    avatarUrl: targetMember.avatarUrl,
    birthDate: targetMember.birthDate,
    notes: targetMember.notes,
    createdAt: targetMember.createdAt,
    updatedAt: new Date(),
    createdByUserId: targetMember.createdByUserId,
    updatedByUserId: targetMember.updatedByUserId,
    deletedByUserId: targetMember.deletedByUserId,
    deletedAt: targetMember.deletedAt,
  };

  return memberRepository.update(new Member(params));
}
