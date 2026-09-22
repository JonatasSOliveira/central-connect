import type { IMemberFinalNotesRepository } from "@/modules/member-profiles/application/ports/IMemberFinalNotesRepository";
import type { IMemberPersonalInfoRepository } from "@/modules/member-profiles/application/ports/IMemberPersonalInfoRepository";
import type { IMemberPracticalSkillRepository } from "@/modules/member-profiles/application/ports/IMemberPracticalSkillRepository";
import type { IMemberProfessionalProfileRepository } from "@/modules/member-profiles/application/ports/IMemberProfessionalProfileRepository";
import type { IMemberServiceAvailabilityRepository } from "@/modules/member-profiles/application/ports/IMemberServiceAvailabilityRepository";
import type { IMemberServiceProfileRepository } from "@/modules/member-profiles/application/ports/IMemberServiceProfileRepository";
import type { IMemberSpiritualJourneyRepository } from "@/modules/member-profiles/application/ports/IMemberSpiritualJourneyRepository";
import { MemberFinalNotes } from "@/modules/member-profiles/domain/entities/MemberFinalNotes";
import { MemberPersonalInfo } from "@/modules/member-profiles/domain/entities/MemberPersonalInfo";
import { MemberPracticalSkill } from "@/modules/member-profiles/domain/entities/MemberPracticalSkill";
import { MemberProfessionalProfile } from "@/modules/member-profiles/domain/entities/MemberProfessionalProfile";
import { MemberServiceAvailability } from "@/modules/member-profiles/domain/entities/MemberServiceAvailability";
import { MemberServiceProfile } from "@/modules/member-profiles/domain/entities/MemberServiceProfile";
import { MemberSpiritualJourney } from "@/modules/member-profiles/domain/entities/MemberSpiritualJourney";
import type { IMemberMinistryInterestRepository } from "@/modules/members/application/ports/IMemberMinistryInterestRepository";
import { MemberMinistryInterest } from "@/modules/members/domain/entities/MemberMinistryInterest";
import type { SelfSignupMemberFormDTO } from "@/modules/self-signup/application/dtos/SelfSignupMemberFormDTO";
import { PracticalSkill } from "@/shared/domain/enums/PracticalSkill";
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
      currentProfession:
        memberForm.professionalProfile.currentProfession.trim(),
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
