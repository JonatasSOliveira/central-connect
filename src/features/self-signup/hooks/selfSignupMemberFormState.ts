import { MutiraoAvailability } from "@/domain/enums/MutiraoAvailability";

export interface SelfSignupMemberFormState {
  basicData: {
    birthDate: string;
    maritalStatus: string;
    hasChildren: boolean;
    childrenCount: number | null;
    childrenAges: string;
    neighborhood: string;
  };
  spiritualJourney: {
    acceptedJesus: string;
    waterBaptized: string;
    baptismDetails: string;
    discipleshipStatus: string;
    churchAttendanceTime: string;
    smallGroupStatus: string;
    officialMemberStatus: string;
  };
  serviceProfile: {
    currentlyServes: boolean;
    currentMinistryIds: string[];
    desiredMinistryIds: string[];
    instrumentalPraiseInstrument: string;
    otherDesiredMinistry: string;
    availabilitySlots: string[];
  };
  professionalProfile: {
    currentProfession: string;
    skills: string[];
    hasDriverLicense: boolean | null;
    hasOwnVehicle: boolean | null;
    languages: string;
    otherSkill: string;
    mutiraoAvailability: string;
  };
  finalNotes: {
    healthLimitations: string;
    leadershipNotes: string;
  };
}

export function getDefaultMemberForm(): SelfSignupMemberFormState {
  return {
    basicData: {
      birthDate: "",
      maritalStatus: "",
      hasChildren: false,
      childrenCount: null,
      childrenAges: "",
      neighborhood: "",
    },
    spiritualJourney: {
      acceptedJesus: "",
      waterBaptized: "",
      baptismDetails: "",
      discipleshipStatus: "",
      churchAttendanceTime: "",
      smallGroupStatus: "",
      officialMemberStatus: "",
    },
    serviceProfile: {
      currentlyServes: false,
      currentMinistryIds: [],
      desiredMinistryIds: [],
      instrumentalPraiseInstrument: "",
      otherDesiredMinistry: "",
      availabilitySlots: [],
    },
    professionalProfile: {
      currentProfession: "",
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
  };
}
