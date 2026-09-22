import { describe, expect, it, vi } from "vitest";
import type { SelfSignupMemberFormDTO } from "@/modules/self-signup/application/dtos/SelfSignupMemberFormDTO";
import { AcceptedJesusStatus } from "@/shared/domain/enums/AcceptedJesusStatus";
import { ChurchAttendanceTime } from "@/shared/domain/enums/ChurchAttendanceTime";
import { DiscipleshipStatus } from "@/shared/domain/enums/DiscipleshipStatus";
import { MaritalStatus } from "@/shared/domain/enums/MaritalStatus";
import { MutiraoAvailability } from "@/shared/domain/enums/MutiraoAvailability";
import { OfficialMemberStatus } from "@/shared/domain/enums/OfficialMemberStatus";
import { PracticalSkill } from "@/shared/domain/enums/PracticalSkill";
import { ServiceAvailabilitySlot } from "@/shared/domain/enums/ServiceAvailabilitySlot";
import { SmallGroupStatus } from "@/shared/domain/enums/SmallGroupStatus";
import { WaterBaptismStatus } from "@/shared/domain/enums/WaterBaptismStatus";
import {
  type SaveSelfSignupMemberFormRepositories,
  saveSelfSignupMemberForm,
} from "./saveSelfSignupMemberForm";

const memberForm: SelfSignupMemberFormDTO = {
  basicData: {
    birthDate: new Date("1990-01-01T00:00:00.000Z"),
    maritalStatus: MaritalStatus.Married,
    hasChildren: true,
    childrenCount: 2,
    childrenAges: "4 e 8",
    neighborhood: "Centro",
  },
  spiritualJourney: {
    acceptedJesus: AcceptedJesusStatus.Yes,
    waterBaptized: WaterBaptismStatus.Yes,
    baptismDetails: "2015, Igreja Central",
    discipleshipStatus: DiscipleshipStatus.Completed,
    churchAttendanceTime: ChurchAttendanceTime.OneToThreeYears,
    smallGroupStatus: SmallGroupStatus.Yes,
    officialMemberStatus: OfficialMemberStatus.Yes,
  },
  serviceProfile: {
    currentlyServes: true,
    currentMinistryIds: ["ministry-current"],
    desiredMinistryIds: ["ministry-desired"],
    instrumentalPraiseInstrument: "Violao",
    otherDesiredMinistry: "",
    availabilitySlots: [ServiceAvailabilitySlot.SundayMorning],
  },
  professionalProfile: {
    currentProfession: "Analista",
    skills: [PracticalSkill.Driving],
    hasDriverLicense: true,
    hasOwnVehicle: false,
    languages: "",
    otherSkill: "",
    mutiraoAvailability: MutiraoAvailability.Occasionally,
  },
  finalNotes: {
    healthLimitations: "Alergia",
    leadershipNotes: "Disponivel para treinamento",
  },
};

function createRepositories(): SaveSelfSignupMemberFormRepositories {
  return {
    personalInfoRepository: { upsertByMemberAndChurch: vi.fn() },
    spiritualJourneyRepository: { upsertByMemberAndChurch: vi.fn() },
    serviceProfileRepository: { upsertByMemberAndChurch: vi.fn() },
    ministryInterestRepository: { replaceByMemberAndChurch: vi.fn() },
    serviceAvailabilityRepository: { replaceByMemberAndChurch: vi.fn() },
    professionalProfileRepository: { upsertByMemberAndChurch: vi.fn() },
    practicalSkillRepository: { replaceByMemberAndChurch: vi.fn() },
    finalNotesRepository: { upsertByMemberAndChurch: vi.fn() },
  } as unknown as SaveSelfSignupMemberFormRepositories;
}

describe("saveSelfSignupMemberForm", () => {
  it("saves member form data through independent repositories", async () => {
    const repositories = createRepositories();

    await saveSelfSignupMemberForm(repositories, {
      memberId: "member-1",
      churchId: "church-1",
      memberForm,
    });

    expect(
      repositories.personalInfoRepository.upsertByMemberAndChurch,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        memberId: "member-1",
        churchId: "church-1",
        maritalStatus: MaritalStatus.Married,
        childrenCount: 2,
      }),
    );
    expect(
      repositories.spiritualJourneyRepository.upsertByMemberAndChurch,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        waterBaptized: WaterBaptismStatus.Yes,
        baptismDetails: "2015, Igreja Central",
      }),
    );
    expect(
      repositories.ministryInterestRepository.replaceByMemberAndChurch,
    ).toHaveBeenCalledWith("member-1", "church-1", [
      expect.objectContaining({ ministryId: "ministry-desired" }),
    ]);
    expect(
      repositories.practicalSkillRepository.replaceByMemberAndChurch,
    ).toHaveBeenCalledWith("member-1", "church-1", [
      expect.objectContaining({
        skill: PracticalSkill.Driving,
        hasDriverLicense: true,
      }),
    ]);
  });
});
