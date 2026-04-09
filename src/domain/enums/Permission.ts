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

  SCALE_READ = "scale:read",
  SCALE_WRITE = "scale:write",
  SCALE_DELETE = "scale:delete",
  SCALE_ATTENDANCE_READ = "scale_attendance:read",
  SCALE_ATTENDANCE_WRITE_DRAFT = "scale_attendance:write_draft",
  SCALE_ATTENDANCE_PUBLISH = "scale_attendance:publish",
  SCALE_ATTENDANCE_WRITE_ANYTIME = "scale_attendance:write_anytime",

  ROLE_READ = "role:read",
  ROLE_WRITE = "role:write",
  ROLE_DELETE = "role:delete",

  MINISTRY_READ = "ministry:read",
  MINISTRY_WRITE = "ministry:write",
  MINISTRY_DELETE = "ministry:delete",

  SERVICE_READ = "service:read",
  SERVICE_WRITE = "service:write",
  SERVICE_DELETE = "service:delete",
  SERVICE_TEMPLATE_READ = "service_template:read",
  SERVICE_TEMPLATE_WRITE = "service_template:write",
  SERVICE_TEMPLATE_DELETE = "service_template:delete",
  SERVICE_TEMPLATE_GENERATE = "service_template:generate",
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
  SCALE: [
    Permission.SCALE_READ,
    Permission.SCALE_WRITE,
    Permission.SCALE_DELETE,
  ],
  SCALE_ATTENDANCE: [
    Permission.SCALE_ATTENDANCE_READ,
    Permission.SCALE_ATTENDANCE_WRITE_DRAFT,
    Permission.SCALE_ATTENDANCE_PUBLISH,
    Permission.SCALE_ATTENDANCE_WRITE_ANYTIME,
  ],
  ROLE: [Permission.ROLE_READ, Permission.ROLE_WRITE, Permission.ROLE_DELETE],
  MINISTRY: [
    Permission.MINISTRY_READ,
    Permission.MINISTRY_WRITE,
    Permission.MINISTRY_DELETE,
  ],
  SERVICE: [
    Permission.SERVICE_READ,
    Permission.SERVICE_WRITE,
    Permission.SERVICE_DELETE,
  ],
  SERVICE_TEMPLATE: [
    Permission.SERVICE_TEMPLATE_READ,
    Permission.SERVICE_TEMPLATE_WRITE,
    Permission.SERVICE_TEMPLATE_DELETE,
    Permission.SERVICE_TEMPLATE_GENERATE,
  ],
} as const;

export const AllPermissions = Object.values(Permission);
