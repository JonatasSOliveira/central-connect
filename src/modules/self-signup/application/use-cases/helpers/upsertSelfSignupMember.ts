import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import {
  Member,
  type MemberParams,
} from "@/modules/members/domain/entities/Member";
import type { SelfSignupMemberFormDTO } from "@/modules/self-signup/application/dtos/SelfSignupMemberFormDTO";

export async function upsertSelfSignupMember(
  memberRepository: IMemberRepository,
  targetMember: Member | null,
  fullName: string,
  phone: string,
  email: string,
  memberForm: SelfSignupMemberFormDTO,
): Promise<Member> {
  if (!targetMember) {
    const now = new Date();
    const params: MemberParams = {
      fullName,
      phone,
      email,
      birthDate: memberForm.basicData.birthDate,
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
    notes: targetMember.notes,
    birthDate: memberForm.basicData.birthDate,
    createdAt: targetMember.createdAt,
    updatedAt: new Date(),
    createdByUserId: targetMember.createdByUserId,
    updatedByUserId: targetMember.updatedByUserId,
    deletedByUserId: targetMember.deletedByUserId,
    deletedAt: targetMember.deletedAt,
  };

  return memberRepository.update(new Member(params));
}
