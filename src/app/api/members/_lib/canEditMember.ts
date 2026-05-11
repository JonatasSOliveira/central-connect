import { Permission } from "@/domain/enums/Permission";

interface MemberAuthorizationUser {
  isSuperAdmin: boolean;
  permissions: string[];
  memberId: string;
}

export function canEditMember(
  user: MemberAuthorizationUser,
  targetMemberId: string,
): boolean {
  return (
    user.isSuperAdmin ||
    user.permissions.includes(Permission.MEMBER_WRITE) ||
    (user.permissions.includes(Permission.MEMBER_SELF_WRITE) &&
      targetMemberId === user.memberId)
  );
}
