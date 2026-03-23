export enum Permission {
  CHURCH_READ = "church:read",
  CHURCH_WRITE = "church:write",

  MEMBER_READ = "member:read",
  MEMBER_WRITE = "member:write",

  SCHEDULE_READ = "schedule:read",
  SCHEDULE_WRITE = "schedule:write",

  ROLE_READ = "role:read",
  ROLE_WRITE = "role:write",

  INVITE_READ = "invite:read",
  INVITE_WRITE = "invite:write",
}

export const PermissionGroups = {
  CHURCH: [Permission.CHURCH_READ, Permission.CHURCH_WRITE],
  MEMBER: [Permission.MEMBER_READ, Permission.MEMBER_WRITE],
  SCHEDULE: [Permission.SCHEDULE_READ, Permission.SCHEDULE_WRITE],
  ROLE: [Permission.ROLE_READ, Permission.ROLE_WRITE],
  INVITE: [Permission.INVITE_READ, Permission.INVITE_WRITE],
} as const;

export const AllPermissions = Object.values(Permission);
