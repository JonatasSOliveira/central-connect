import type { SignupFormState } from "./selfSignupTypes";

export function setCurrentMinistry(
  state: SignupFormState,
  ministryId: string,
): SignupFormState {
  const ministryIds = state.ministryIds.includes(ministryId)
    ? state.ministryIds.filter((id) => id !== ministryId)
    : [...state.ministryIds, ministryId];

  return {
    ...state,
    ministryIds,
    confirmNoMinistry: ministryIds.length === 0 && state.confirmNoMinistry,
    memberForm: {
      ...state.memberForm,
      serviceProfile: {
        ...state.memberForm.serviceProfile,
        currentlyServes: ministryIds.length > 0,
        currentMinistryIds: ministryIds,
      },
    },
  };
}

export function setDesiredMinistry(
  state: SignupFormState,
  ministryId: string,
): SignupFormState {
  const current = state.memberForm.serviceProfile.desiredMinistryIds;
  const desiredMinistryIds = current.includes(ministryId)
    ? current.filter((id) => id !== ministryId)
    : [...current, ministryId];

  return {
    ...state,
    memberForm: {
      ...state.memberForm,
      serviceProfile: {
        ...state.memberForm.serviceProfile,
        desiredMinistryIds,
      },
    },
  };
}

export function setAvailabilitySlot(
  state: SignupFormState,
  slot: string,
): SignupFormState {
  const current = state.memberForm.serviceProfile.availabilitySlots;
  const availabilitySlots = current.includes(slot)
    ? current.filter((value) => value !== slot)
    : [...current, slot];

  return {
    ...state,
    memberForm: {
      ...state.memberForm,
      serviceProfile: {
        ...state.memberForm.serviceProfile,
        availabilitySlots,
      },
    },
  };
}

export function setPracticalSkill(
  state: SignupFormState,
  skill: string,
): SignupFormState {
  const current = state.memberForm.professionalProfile.skills;
  const skills = current.includes(skill)
    ? current.filter((value) => value !== skill)
    : [...current, skill];

  return {
    ...state,
    memberForm: {
      ...state.memberForm,
      professionalProfile: {
        ...state.memberForm.professionalProfile,
        skills,
      },
    },
  };
}
