import { Permission } from "@/domain/enums/Permission";

interface MemberProfileReader {
  isSuperAdmin: boolean;
  churchId: string | null;
  permissions: string[];
}

export function canReadMemberProfiles(
  user: MemberProfileReader,
  churchId: string,
): boolean {
  return (
    user.isSuperAdmin ||
    (user.churchId === churchId &&
      user.permissions.includes(Permission.MEMBER_PROFILE_READ))
  );
}
