import type { SelfSignupMemberFormDTO } from "@/application/dtos/self-signup/SelfSignupMemberFormDTO";
import { MemberFinalNotes } from "@/domain/entities/MemberFinalNotes";
import { MemberMinistryInterest } from "@/domain/entities/MemberMinistryInterest";
import { MemberPersonalInfo } from "@/domain/entities/MemberPersonalInfo";
import { MemberPracticalSkill } from "@/domain/entities/MemberPracticalSkill";
import { MemberProfessionalProfile } from "@/domain/entities/MemberProfessionalProfile";
import { MemberServiceAvailability } from "@/domain/entities/MemberServiceAvailability";
import { MemberServiceProfile } from "@/domain/entities/MemberServiceProfile";
import { MemberSpiritualJourney } from "@/domain/entities/MemberSpiritualJourney";
import type { IMemberFinalNotesRepository } from "@/domain/ports/IMemberFinalNotesRepository";
import type { IMemberMinistryInterestRepository } from "@/domain/ports/IMemberMinistryInterestRepository";
import type { IMemberPersonalInfoRepository } from "@/domain/ports/IMemberPersonalInfoRepository";
import type { IMemberPracticalSkillRepository } from "@/domain/ports/IMemberPracticalSkillRepository";
import type { IMemberProfessionalProfileRepository } from "@/domain/ports/IMemberProfessionalProfileRepository";
import type { IMemberServiceAvailabilityRepository } from "@/domain/ports/IMemberServiceAvailabilityRepository";
import type { IMemberServiceProfileRepository } from "@/domain/ports/IMemberServiceProfileRepository";
import type { IMemberSpiritualJourneyRepository } from "@/domain/ports/IMemberSpiritualJourneyRepository";
import { PracticalSkill } from "@/domain/enums/PracticalSkill";
import { normalizeOptionalText } from "./normalizeOptionalText";

export interface SaveSelfSignupMemberFormRepositories {
  personalInfoRepository: IMemberPersonalInfoRepository;
  spiritualJourneyRepository: IMemberSpiritualJourneyRepository;
  serviceProfileRepository: IMemberServiceProfileRepository;
  ministryInterestRepository: IMemberMinistryInterestRepository;
  serviceAvailabilityRepository: IMemberServiceAvailabilityRepository;
  professionalProfileRepository: IMemberProfessionalProfileRepository;
  practicalSkillRepository: IMemberPracticalSkillRepository;
  finalNotesRepository: IMemberFinalNotesRepository;
}

interface SaveSelfSignupMemberFormInput {
  memberId: string;
  churchId: string;
  memberForm: SelfSignupMemberFormDTO;
}

export async function saveSelfSignupMemberForm(
  repositories: SaveSelfSignupMemberFormRepositories,
  input: SaveSelfSignupMemberFormInput,
): Promise<void> {
  const { churchId, memberId, memberForm } = input;
  const now = new Date();

  await repositories.personalInfoRepository.upsertByMemberAndChurch(
    new MemberPersonalInfo({
      memberId,
      churchId,
      maritalStatus: memberForm.basicData.maritalStatus,
      hasChildren: memberForm.basicData.hasChildren,
      childrenCount: memberForm.basicData.hasChildren
        ? (memberForm.basicData.childrenCount ?? null)
        : null,
      childrenAges: memberForm.basicData.hasChildren
        ? normalizeOptionalText(memberForm.basicData.childrenAges)
        : null,
      neighborhood: memberForm.basicData.neighborhood.trim(),
      createdAt: now,
      updatedAt: now,
    }),
  );

  await repositories.spiritualJourneyRepository.upsertByMemberAndChurch(
    new MemberSpiritualJourney({
      memberId,
      churchId,
      ...memberForm.spiritualJourney,
      baptismDetails: normalizeOptionalText(
        memberForm.spiritualJourney.baptismDetails,
      ),
      createdAt: now,
      updatedAt: now,
    }),
  );

  await repositories.serviceProfileRepository.upsertByMemberAndChurch(
    new MemberServiceProfile({
      memberId,
      churchId,
      currentlyServes: memberForm.serviceProfile.currentlyServes,
      instrumentalPraiseInstrument: normalizeOptionalText(
        memberForm.serviceProfile.instrumentalPraiseInstrument,
      ),
      otherDesiredMinistry: normalizeOptionalText(
        memberForm.serviceProfile.otherDesiredMinistry,
      ),
      createdAt: now,
      updatedAt: now,
    }),
  );

  await repositories.ministryInterestRepository.replaceByMemberAndChurch(
    memberId,
    churchId,
    memberForm.serviceProfile.desiredMinistryIds.map(
      (ministryId) =>
        new MemberMinistryInterest({
          memberId,
          churchId,
          ministryId,
          createdAt: now,
          updatedAt: now,
        }),
    ),
  );

  await repositories.serviceAvailabilityRepository.replaceByMemberAndChurch(
    memberId,
    churchId,
    memberForm.serviceProfile.availabilitySlots.map(
      (slot) =>
        new MemberServiceAvailability({
          memberId,
          churchId,
          slot,
          createdAt: now,
          updatedAt: now,
        }),
    ),
  );

  await repositories.professionalProfileRepository.upsertByMemberAndChurch(
    new MemberProfessionalProfile({
      memberId,
      churchId,
      currentProfession: memberForm.professionalProfile.currentProfession.trim(),
      mutiraoAvailability: memberForm.professionalProfile.mutiraoAvailability,
      createdAt: now,
      updatedAt: now,
    }),
  );

  await repositories.practicalSkillRepository.replaceByMemberAndChurch(
    memberId,
    churchId,
    memberForm.professionalProfile.skills.map(
      (skill) =>
        new MemberPracticalSkill({
          memberId,
          churchId,
          skill,
          hasDriverLicense:
            skill === PracticalSkill.Driving
              ? (memberForm.professionalProfile.hasDriverLicense ?? null)
              : null,
          hasOwnVehicle:
            skill === PracticalSkill.Driving
              ? (memberForm.professionalProfile.hasOwnVehicle ?? null)
              : null,
          languages:
            skill === PracticalSkill.TranslationLanguages
              ? normalizeOptionalText(memberForm.professionalProfile.languages)
              : null,
          otherSkill:
            skill === PracticalSkill.Other
              ? normalizeOptionalText(memberForm.professionalProfile.otherSkill)
              : null,
          createdAt: now,
          updatedAt: now,
        }),
    ),
  );

  await repositories.finalNotesRepository.upsertByMemberAndChurch(
    new MemberFinalNotes({
      memberId,
      churchId,
      healthLimitations: normalizeOptionalText(
        memberForm.finalNotes.healthLimitations,
      ),
      leadershipNotes: normalizeOptionalText(
        memberForm.finalNotes.leadershipNotes,
      ),
      createdAt: now,
      updatedAt: now,
    }),
  );
}
