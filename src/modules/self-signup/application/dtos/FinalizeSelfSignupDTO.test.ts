import { describe, expect, it } from "vitest";
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
import { FinalizeSelfSignupInputSchema } from "./FinalizeSelfSignupDTO";

const basePayload = {
  googleToken: "token",
  fullName: "Joao da Silva",
  phone: "11999999999",
  acceptedTerms: true,
  ministryIds: ["m1"],
  confirmNoMinistry: false,
  memberForm: {
    basicData: {
      birthDate: "1990-01-01",
      maritalStatus: MaritalStatus.Married,
      hasChildren: false,
      childrenCount: null,
      childrenAges: "",
      neighborhood: "Centro",
    },
    spiritualJourney: {
      acceptedJesus: AcceptedJesusStatus.Yes,
      waterBaptized: WaterBaptismStatus.No,
      baptismDetails: "",
      discipleshipStatus: DiscipleshipStatus.Completed,
      churchAttendanceTime: ChurchAttendanceTime.OneToThreeYears,
      smallGroupStatus: SmallGroupStatus.Yes,
      officialMemberStatus: OfficialMemberStatus.Yes,
    },
    serviceProfile: {
      currentlyServes: true,
      currentMinistryIds: ["m1"],
      desiredMinistryIds: [],
      instrumentalPraiseInstrument: "",
      otherDesiredMinistry: "",
      availabilitySlots: [ServiceAvailabilitySlot.SundayMorning],
    },
    professionalProfile: {
      currentProfession: "Analista",
      skills: [],
      hasDriverLicense: null,
      hasOwnVehicle: null,
      languages: "",
      otherSkill: "",
      mutiraoAvailability: MutiraoAvailability.Occasionally,
    },
    finalNotes: {
      healthLimitations: "",
      leadershipNotes: "",
    },
  },
};

describe("FinalizeSelfSignupInputSchema", () => {
  it("accepts payload when terms are accepted", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("rejects payload when terms are not accepted", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      acceptedTerms: false,
    });

    expect(result.success).toBe(false);
  });

  it("accepts payload with ministryIds", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      ministryIds: ["m1", "m2"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects payload with empty ministryIds and no confirmation", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      ministryIds: [],
      confirmNoMinistry: false,
    });

    expect(result.success).toBe(false);
  });

  it("accepts payload with empty ministryIds when confirmed", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      ministryIds: [],
      confirmNoMinistry: true,
      memberForm: {
        ...basePayload.memberForm,
        serviceProfile: {
          ...basePayload.memberForm.serviceProfile,
          currentlyServes: false,
          currentMinistryIds: [],
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects children without count", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      memberForm: {
        ...basePayload.memberForm,
        basicData: {
          ...basePayload.memberForm.basicData,
          hasChildren: true,
          childrenCount: null,
        },
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects baptized member without baptism details", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      memberForm: {
        ...basePayload.memberForm,
        spiritualJourney: {
          ...basePayload.memberForm.spiritualJourney,
          waterBaptized: WaterBaptismStatus.Yes,
          baptismDetails: "",
        },
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects driving skill without driving details", () => {
    const result = FinalizeSelfSignupInputSchema.safeParse({
      ...basePayload,
      memberForm: {
        ...basePayload.memberForm,
        professionalProfile: {
          ...basePayload.memberForm.professionalProfile,
          skills: [PracticalSkill.Driving],
          hasDriverLicense: null,
          hasOwnVehicle: null,
        },
      },
    });

    expect(result.success).toBe(false);
  });
});
