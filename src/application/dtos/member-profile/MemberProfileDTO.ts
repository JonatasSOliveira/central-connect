import type { AcceptedJesusStatus } from "@/domain/enums/AcceptedJesusStatus";
import type { ChurchAttendanceTime } from "@/domain/enums/ChurchAttendanceTime";
import type { DiscipleshipStatus } from "@/domain/enums/DiscipleshipStatus";
import type { MaritalStatus } from "@/domain/enums/MaritalStatus";
import type { MutiraoAvailability } from "@/domain/enums/MutiraoAvailability";
import type { OfficialMemberStatus } from "@/domain/enums/OfficialMemberStatus";
import type { PracticalSkill } from "@/domain/enums/PracticalSkill";
import type { ServiceAvailabilitySlot } from "@/domain/enums/ServiceAvailabilitySlot";
import type { SmallGroupStatus } from "@/domain/enums/SmallGroupStatus";
import type { WaterBaptismStatus } from "@/domain/enums/WaterBaptismStatus";

export type CountByValue<T extends string> = {
  value: T;
  count: number;
};

export type MinistryCount = {
  ministryId: string;
  ministryName: string;
  count: number;
};

export type MemberProfileFilters = {
  practicalSkills?: PracticalSkill[];
  acceptedJesus?: AcceptedJesusStatus[];
  waterBaptized?: WaterBaptismStatus[];
  maritalStatus?: MaritalStatus[];
  currentMinistryIds?: string[];
  desiredMinistryIds?: string[];
  availabilitySlots?: ServiceAvailabilitySlot[];
  discipleshipStatus?: DiscipleshipStatus[];
  smallGroupStatus?: SmallGroupStatus[];
  churchAttendanceTime?: ChurchAttendanceTime[];
  officialMemberStatus?: OfficialMemberStatus[];
  hasChildren?: boolean;
  hasDriverLicense?: boolean;
  hasOwnVehicle?: boolean;
  mutiraoAvailability?: MutiraoAvailability[];
};

export type MemberProfileListItemDTO = {
  memberId: string;
  fullName: string;
  phone: string | null;
  maritalStatus: MaritalStatus | null;
  acceptedJesus: AcceptedJesusStatus | null;
  waterBaptized: WaterBaptismStatus | null;
  currentMinistryIds: string[];
  desiredMinistryIds: string[];
  practicalSkills: PracticalSkill[];
  hasCompleteProfile: boolean;
};

export type MemberProfileSummaryDTO = {
  totalMembersInChurch: number;
  totalWithProfile: number;
  totalFiltered: number;
  byPracticalSkill: CountByValue<PracticalSkill>[];
  byMaritalStatus: CountByValue<MaritalStatus>[];
  byAcceptedJesus: CountByValue<AcceptedJesusStatus>[];
  byWaterBaptism: CountByValue<WaterBaptismStatus>[];
  byCurrentMinistry: MinistryCount[];
  byDesiredMinistry: MinistryCount[];
  byServiceAvailability: CountByValue<ServiceAvailabilitySlot>[];
  byMutiraoAvailability: CountByValue<MutiraoAvailability>[];
};

export type MemberProfileFilterOption = {
  value: string;
  label: string;
};

export type MemberProfileFilterOptionsDTO = {
  ministries: MemberProfileFilterOption[];
};

export type MemberProfileListOutputDTO = {
  summary: MemberProfileSummaryDTO;
  members: MemberProfileListItemDTO[];
  filterOptions: MemberProfileFilterOptionsDTO;
};

export type MemberProfileDetailDTO = {
  memberId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  hasCompleteProfile: boolean;
  personalInfo: {
    maritalStatus: MaritalStatus;
    hasChildren: boolean;
    childrenCount: number | null;
    childrenAges: string | null;
    neighborhood: string;
  } | null;
  spiritualJourney: {
    acceptedJesus: AcceptedJesusStatus;
    waterBaptized: WaterBaptismStatus;
    baptismDetails: string | null;
    discipleshipStatus: DiscipleshipStatus;
    churchAttendanceTime: ChurchAttendanceTime;
    smallGroupStatus: SmallGroupStatus;
    officialMemberStatus: OfficialMemberStatus;
  } | null;
  serviceProfile: {
    currentlyServes: boolean;
    currentMinistryIds: string[];
    desiredMinistryIds: string[];
    availabilitySlots: ServiceAvailabilitySlot[];
    instrumentalPraiseInstrument: string | null;
    otherDesiredMinistry: string | null;
  } | null;
  professionalProfile: {
    currentProfession: string;
    mutiraoAvailability: MutiraoAvailability;
    skills: {
      skill: PracticalSkill;
      hasDriverLicense: boolean | null;
      hasOwnVehicle: boolean | null;
      languages: string | null;
      otherSkill: string | null;
    }[];
  } | null;
  finalNotes: {
    healthLimitations: string | null;
    leadershipNotes: string | null;
  } | null;
  ministriesById: Record<string, string>;
};
