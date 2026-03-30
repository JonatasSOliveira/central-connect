export enum Permission {
  CHURCH_READ = "church:read",
  CHURCH_WRITE = "church:write",
  CHURCH_DELETE = "church:delete",
  CHURCH_SELF_READ = "church:self:read",
  CHURCH_SELF_WRITE = "church:self:write",

  MEMBER_READ = "member:read",
  MEMBER_WRITE = "member:write",
  MEMBER_DELETE = "member:delete",
  MEMBER_SELF_WRITE = "member:self:write",

  SCHEDULE_READ = "schedule:read",
  SCHEDULE_WRITE = "schedule:write",
  SCHEDULE_DELETE = "schedule:delete",

  ROLE_READ = "role:read",
  ROLE_WRITE = "role:write",
  ROLE_DELETE = "role:delete",

  MINISTRY_READ = "ministry:read",
  MINISTRY_WRITE = "ministry:write",
  MINISTRY_DELETE = "ministry:delete",
}

export const PermissionGroups = {
  CHURCH: [
    Permission.CHURCH_READ,
    Permission.CHURCH_WRITE,
    Permission.CHURCH_DELETE,
    Permission.CHURCH_SELF_READ,
    Permission.CHURCH_SELF_WRITE,
  ],
  MEMBER: [
    Permission.MEMBER_READ,
    Permission.MEMBER_WRITE,
    Permission.MEMBER_DELETE,
    Permission.MEMBER_SELF_WRITE,
  ],
  SCHEDULE: [
    Permission.SCHEDULE_READ,
    Permission.SCHEDULE_WRITE,
    Permission.SCHEDULE_DELETE,
  ],
  ROLE: [Permission.ROLE_READ, Permission.ROLE_WRITE, Permission.ROLE_DELETE],
  MINISTRY: [
    Permission.MINISTRY_READ,
    Permission.MINISTRY_WRITE,
    Permission.MINISTRY_DELETE,
  ],
} as const;

export const AllPermissions = Object.values(Permission);
