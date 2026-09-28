export function createMemberForm() {
  return {
    basicData: {
      birthDate: new Date("1990-01-01"),
      maritalStatus: "Married" as never,
      hasChildren: false,
      childrenCount: null,
      childrenAges: "",
      neighborhood: "Centro",
    },
    spiritualJourney: {
      acceptedJesus: "Yes" as never,
      waterBaptized: "No" as never,
      baptismDetails: "",
      discipleshipStatus: "Completed" as never,
      churchAttendanceTime: "OneToThreeYears" as never,
      smallGroupStatus: "Yes" as never,
      officialMemberStatus: "Yes" as never,
    },
    serviceProfile: {
      currentlyServes: false,
      currentMinistryIds: [],
      desiredMinistryIds: [],
      instrumentalPraiseInstrument: "",
      otherDesiredMinistry: "",
      availabilitySlots: ["SundayMorning" as never],
    },
    professionalProfile: {
      currentProfession: "Analista",
      skills: [],
      hasDriverLicense: null,
      hasOwnVehicle: null,
      languages: "",
      otherSkill: "",
      mutiraoAvailability: "Occasionally" as never,
    },
    finalNotes: { healthLimitations: "", leadershipNotes: "" },
  };
}
