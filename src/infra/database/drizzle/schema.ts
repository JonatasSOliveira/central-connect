import {
  boolean,
  date,
  integer,
  index,
  jsonb,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export const userRoles = pgTable(
  "user_roles",
  {
    id: id(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    isSystem: boolean("is_system").default(false).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("user_roles_name_idx").on(table.name)],
);

export const churches = pgTable("churches", {
  id: id(),
  name: varchar("name", { length: 180 }).notNull(),
  selfSignupDefaultRoleId: uuid("self_signup_default_role_id").references(
    () => userRoles.id,
  ),
  maxConsecutiveScalesPerMember: integer("max_consecutive_scales_per_member")
    .default(2)
    .notNull(),
  ...timestamps,
});

export const members = pgTable(
  "members",
  {
    id: id(),
    email: varchar("email", { length: 320 }),
    fullName: varchar("full_name", { length: 180 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    phoneNormalized: varchar("phone_normalized", { length: 40 }),
    maxServicesPerMonth: integer("max_services_per_month").default(4).notNull(),
    status: varchar("status", { length: 20 }).default("Active").notNull(),
    avatarUrl: text("avatar_url"),
    birthDate: date("birth_date", { mode: "date" }),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("members_email_idx").on(table.email),
    index("members_phone_normalized_idx").on(table.phoneNormalized),
    index("members_full_name_idx").on(table.fullName),
    index("members_status_idx").on(table.status),
  ],
);

export const users = pgTable(
  "users",
  {
    id: id(),
    firebaseUid: varchar("firebase_uid", { length: 180 }),
    memberId: uuid("member_id").references(() => members.id),
    googleAccessToken: text("google_access_token"),
    googleRefreshToken: text("google_refresh_token"),
    isActive: boolean("is_active").default(true).notNull(),
    isSuperAdmin: boolean("is_super_admin").default(false).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdByUserId: uuid("created_by_user_id"),
    updatedByUserId: uuid("updated_by_user_id"),
    deletedByUserId: uuid("deleted_by_user_id"),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_firebase_uid_idx").on(table.firebaseUid)],
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: id(),
    userRoleId: uuid("user_role_id")
      .notNull()
      .references(() => userRoles.id),
    permission: varchar("permission", { length: 120 }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("role_permissions_role_permission_idx").on(
      table.userRoleId,
      table.permission,
    ),
  ],
);

export const memberChurches = pgTable(
  "member_churches",
  {
    id: id(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    roleId: uuid("role_id").references(() => userRoles.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("member_churches_member_church_idx").on(
      table.memberId,
      table.churchId,
    ),
  ],
);

export const legalConsents = pgTable("legal_consents", {
  id: id(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  churchId: uuid("church_id")
    .notNull()
    .references(() => churches.id),
  termsVersion: varchar("terms_version", { length: 40 }).notNull(),
  privacyPolicyVersion: varchar("privacy_policy_version", {
    length: 40,
  }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  ipAddress: varchar("ip_address", { length: 80 }),
  userAgent: text("user_agent"),
  source: varchar("source", { length: 40 }).notNull(),
  ...timestamps,
});

export const ministries = pgTable(
  "ministries",
  {
    id: id(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    name: varchar("name", { length: 160 }).notNull(),
    leaderId: uuid("leader_id").references(() => members.id),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("ministries_church_name_idx").on(table.churchId, table.name),
  ],
);

export const ministryRoles = pgTable(
  "ministry_roles",
  {
    id: id(),
    ministryId: uuid("ministry_id")
      .notNull()
      .references(() => ministries.id),
    name: varchar("name", { length: 160 }).notNull(),
    requiredCount: integer("required_count").default(1).notNull(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    updatedByUserId: uuid("updated_by_user_id").references(() => users.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("ministry_roles_ministry_name_idx").on(
      table.ministryId,
      table.name,
    ),
  ],
);

export const memberMinistries = pgTable(
  "member_ministries",
  {
    id: id(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    ministryId: uuid("ministry_id")
      .notNull()
      .references(() => ministries.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("member_ministries_member_ministry_idx").on(
      table.memberId,
      table.ministryId,
    ),
  ],
);

export const memberMinistryRoles = pgTable(
  "member_ministry_roles",
  {
    id: id(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    ministryId: uuid("ministry_id")
      .notNull()
      .references(() => ministries.id),
    ministryRoleId: uuid("ministry_role_id")
      .notNull()
      .references(() => ministryRoles.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("member_ministry_roles_member_role_idx").on(
      table.memberId,
      table.ministryRoleId,
    ),
  ],
);

export const memberMinistryInterests = pgTable(
  "member_ministry_interests",
  {
    id: id(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    ministryId: uuid("ministry_id")
      .notNull()
      .references(() => ministries.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("member_ministry_interests_member_ministry_idx").on(
      table.memberId,
      table.ministryId,
    ),
  ],
);

export const memberAvailabilities = pgTable(
  "member_availabilities",
  {
    id: id(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    mode: varchar("mode", { length: 20 }).notNull(),
    daysOfWeek: jsonb("days_of_week").$type<string[]>().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("member_availabilities_member_idx").on(table.memberId),
  ],
);

const profileColumns = {
  id: id(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  churchId: uuid("church_id")
    .notNull()
    .references(() => churches.id),
  ...timestamps,
};

export const memberFinalNotes = pgTable(
  "member_final_notes",
  {
    ...profileColumns,
    healthLimitations: text("health_limitations"),
    leadershipNotes: text("leadership_notes"),
  },
  (table) => [
    uniqueIndex("member_final_notes_member_church_idx").on(
      table.memberId,
      table.churchId,
    ),
  ],
);
export const memberPersonalInfos = pgTable(
  "member_personal_infos",
  {
    ...profileColumns,
    maritalStatus: varchar("marital_status", { length: 40 }),
    hasChildren: boolean("has_children"),
    childrenCount: integer("children_count"),
    childrenAges: jsonb("children_ages").$type<string | null>(),
    neighborhood: varchar("neighborhood", { length: 160 }),
  },
  (table) => [
    uniqueIndex("member_personal_infos_member_church_idx").on(
      table.memberId,
      table.churchId,
    ),
  ],
);
export const memberPracticalSkills = pgTable(
  "member_practical_skills",
  {
    ...profileColumns,
    skill: text("skill"),
    hasDriverLicense: boolean("has_driver_license"),
    hasOwnVehicle: boolean("has_own_vehicle"),
    languages: jsonb("languages").$type<string | null>(),
    otherSkill: text("other_skill"),
  },
  (table) => [
    uniqueIndex("member_practical_skills_member_church_idx").on(
      table.memberId,
      table.churchId,
    ),
  ],
);
export const memberProfessionalProfiles = pgTable(
  "member_professional_profiles",
  {
    ...profileColumns,
    currentProfession: varchar("current_profession", { length: 160 }),
    mutiraoAvailability: varchar("mutirao_availability", { length: 40 }),
  },
  (table) => [
    uniqueIndex("member_professional_profiles_member_church_idx").on(
      table.memberId,
      table.churchId,
    ),
  ],
);
export const memberServiceProfiles = pgTable(
  "member_service_profiles",
  {
    ...profileColumns,
    currentlyServes: boolean("currently_serves"),
    instrumentalPraiseInstrument: varchar("instrumental_praise_instrument", {
      length: 120,
    }),
    otherDesiredMinistry: text("other_desired_ministry"),
  },
  (table) => [
    uniqueIndex("member_service_profiles_member_church_idx").on(
      table.memberId,
      table.churchId,
    ),
  ],
);
export const memberSpiritualJourneys = pgTable(
  "member_spiritual_journeys",
  {
    ...profileColumns,
    acceptedJesus: varchar("accepted_jesus", { length: 40 }),
    waterBaptized: varchar("water_baptized", { length: 40 }),
    baptismDetails: text("baptism_details"),
    discipleshipStatus: varchar("discipleship_status", { length: 40 }),
    churchAttendanceTime: varchar("church_attendance_time", { length: 40 }),
    smallGroupStatus: varchar("small_group_status", { length: 40 }),
    officialMemberStatus: varchar("official_member_status", { length: 40 }),
  },
  (table) => [
    uniqueIndex("member_spiritual_journeys_member_church_idx").on(
      table.memberId,
      table.churchId,
    ),
  ],
);
export const memberServiceAvailabilities = pgTable(
  "member_service_availabilities",
  { ...profileColumns, slot: varchar("slot", { length: 80 }).notNull() },
  (table) => [
    uniqueIndex("member_service_availabilities_member_church_slot_idx").on(
      table.memberId,
      table.churchId,
      table.slot,
    ),
  ],
);

export const serviceTemplates = pgTable(
  "service_templates",
  {
    id: id(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    title: varchar("title", { length: 180 }).notNull(),
    dayOfWeek: varchar("day_of_week", { length: 20 }).notNull(),
    time: time("time").notNull(),
    location: varchar("location", { length: 180 }),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index("service_templates_church_active_idx").on(
      table.churchId,
      table.isActive,
    ),
    index("service_templates_church_day_idx").on(
      table.churchId,
      table.dayOfWeek,
    ),
  ],
);

export const services = pgTable(
  "services",
  {
    id: id(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    serviceTemplateId: uuid("service_template_id").references(
      () => serviceTemplates.id,
    ),
    title: varchar("title", { length: 180 }).notNull(),
    dayOfWeek: varchar("day_of_week", { length: 20 }).notNull(),
    time: time("time").notNull(),
    date: date("date", { mode: "date" }).notNull(),
    location: varchar("location", { length: 180 }),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    index("services_church_date_idx").on(table.churchId, table.date),
    index("services_church_template_date_idx").on(
      table.churchId,
      table.serviceTemplateId,
      table.date,
    ),
  ],
);

export const scales = pgTable(
  "scales",
  {
    id: id(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    ministryId: uuid("ministry_id")
      .notNull()
      .references(() => ministries.id),
    status: varchar("status", { length: 20 }).default("draft").notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("scales_church_status_idx").on(table.churchId, table.status),
    index("scales_church_service_idx").on(table.churchId, table.serviceId),
    index("scales_church_ministry_idx").on(table.churchId, table.ministryId),
  ],
);

export const scaleMembers = pgTable(
  "scale_members",
  {
    id: id(),
    scaleId: uuid("scale_id")
      .notNull()
      .references(() => scales.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    ministryRoleId: uuid("ministry_role_id")
      .notNull()
      .references(() => ministryRoles.id),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("scale_members_scale_member_idx").on(
      table.scaleId,
      table.memberId,
    ),
    index("scale_members_member_idx").on(table.memberId),
    index("scale_members_scale_idx").on(table.scaleId),
  ],
);

export const scaleAttendances = pgTable(
  "scale_attendances",
  {
    id: id(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    scaleId: uuid("scale_id")
      .notNull()
      .references(() => scales.id),
    status: varchar("status", { length: 20 }).default("draft").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishedByUserId: uuid("published_by_user_id").references(() => users.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("scale_attendances_scale_idx").on(table.scaleId),
    index("scale_attendances_church_status_idx").on(
      table.churchId,
      table.status,
    ),
  ],
);

export const scaleAttendanceMembers = pgTable(
  "scale_attendance_members",
  {
    id: id(),
    scaleAttendanceId: uuid("scale_attendance_id")
      .notNull()
      .references(() => scaleAttendances.id),
    scaleId: uuid("scale_id")
      .notNull()
      .references(() => scales.id),
    scaleMemberId: uuid("scale_member_id")
      .notNull()
      .references(() => scaleMembers.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    status: varchar("status", { length: 30 }).notNull(),
    justification: text("justification"),
    checkedAt: timestamp("checked_at", { withTimezone: true }),
    checkedByUserId: uuid("checked_by_user_id").references(() => users.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("scale_attendance_members_attendance_member_idx").on(
      table.scaleAttendanceId,
      table.memberId,
    ),
    index("scale_attendance_members_scale_idx").on(table.scaleId),
    index("scale_attendance_members_member_idx").on(table.memberId),
  ],
);

export const scaleGenerationJobs = pgTable(
  "scale_generation_jobs",
  {
    id: id(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    serviceId: uuid("service_id").references(() => services.id),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    leaseExpiresAt: timestamp("lease_expires_at", { withTimezone: true }),
    error: text("error"),
    ...timestamps,
  },
  (table) => [
    index("scale_generation_jobs_status_schedule_idx").on(
      table.status,
      table.scheduledFor,
    ),
    index("scale_generation_jobs_lease_idx").on(table.leaseExpiresAt),
    index("scale_generation_jobs_church_idx").on(table.churchId),
  ],
);

export const memberPushTokens = pgTable(
  "member_push_tokens",
  {
    id: id(),
    churchId: uuid("church_id")
      .notNull()
      .references(() => churches.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    token: text("token").notNull(),
    deviceId: varchar("device_id", { length: 180 }),
    platform: varchar("platform", { length: 20 }).default("web").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    failureCount: integer("failure_count").default(0).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    lastFailureAt: timestamp("last_failure_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("member_push_tokens_token_idx").on(table.token),
    index("member_push_tokens_church_member_active_idx").on(
      table.churchId,
      table.memberId,
      table.isActive,
    ),
  ],
);
