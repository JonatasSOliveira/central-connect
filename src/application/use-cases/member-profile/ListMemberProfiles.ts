import type {
  MemberProfileFilters,
  MemberProfileListOutputDTO,
} from "@/application/dtos/member-profile/MemberProfileDTO";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberFinalNotesRepository } from "@/domain/ports/IMemberFinalNotesRepository";
import type { IMemberMinistryInterestRepository } from "@/domain/ports/IMemberMinistryInterestRepository";
import type { IMemberMinistryRepository } from "@/domain/ports/IMemberMinistryRepository";
import type { IMemberPersonalInfoRepository } from "@/domain/ports/IMemberPersonalInfoRepository";
import type { IMemberPracticalSkillRepository } from "@/domain/ports/IMemberPracticalSkillRepository";
import type { IMemberProfessionalProfileRepository } from "@/domain/ports/IMemberProfessionalProfileRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IMemberServiceAvailabilityRepository } from "@/domain/ports/IMemberServiceAvailabilityRepository";
import type { IMemberServiceProfileRepository } from "@/domain/ports/IMemberServiceProfileRepository";
import type { IMemberSpiritualJourneyRepository } from "@/domain/ports/IMemberSpiritualJourneyRepository";
import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import { matchesMemberProfileFilters } from "./memberProfileFilters";
import { toMemberProfileListItem } from "./memberProfileMapping";
import {
  groupByMemberId,
  hasProfileData,
  indexByMemberId,
  type MemberProfileRecord,
} from "./memberProfileModel";
import { buildMemberProfileSummary } from "./memberProfileSummary";

export type ListMemberProfilesInput = {
  churchId: string;
  filters: MemberProfileFilters;
};

export class ListMemberProfiles extends BaseUseCase<
  ListMemberProfilesInput,
  MemberProfileListOutputDTO
> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly memberMinistryRepository: IMemberMinistryRepository,
    private readonly ministryRepository: IMinistryRepository,
    private readonly personalInfoRepository: IMemberPersonalInfoRepository,
    private readonly spiritualJourneyRepository: IMemberSpiritualJourneyRepository,
    private readonly serviceProfileRepository: IMemberServiceProfileRepository,
    private readonly ministryInterestRepository: IMemberMinistryInterestRepository,
    private readonly serviceAvailabilityRepository: IMemberServiceAvailabilityRepository,
    private readonly professionalProfileRepository: IMemberProfessionalProfileRepository,
    private readonly practicalSkillRepository: IMemberPracticalSkillRepository,
    private readonly finalNotesRepository: IMemberFinalNotesRepository,
  ) {
    super();
  }

  async execute(
    input: ListMemberProfilesInput,
  ): Promise<Result<MemberProfileListOutputDTO>> {
    try {
      const records = await this.loadRecords(input.churchId);
      const profileRecords = records.filter(hasProfileData);
      const filteredRecords = profileRecords.filter((record) =>
        matchesMemberProfileFilters(record, input.filters),
      );
      const ministries = await this.ministryRepository.findByChurchId(
        input.churchId,
      );

      return {
        ok: true,
        value: {
          summary: buildMemberProfileSummary(records, filteredRecords, ministries),
          members: filteredRecords
            .map(toMemberProfileListItem)
            .sort((a, b) =>
              a.fullName.localeCompare(b.fullName, "pt-BR", {
                sensitivity: "base",
              }),
            ),
          filterOptions: {
            ministries: ministries.map((ministry) => ({
              value: ministry.id,
              label: ministry.name,
            })),
          },
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "LIST_MEMBER_PROFILES_FAILED",
          message: "Falha ao listar perfis dos membros",
        },
      };
    }
  }

  private async loadRecords(churchId: string): Promise<MemberProfileRecord[]> {
    const memberChurches = await this.memberChurchRepository.findByChurchId(churchId);
    const memberIds = memberChurches.map((memberChurch) => memberChurch.memberId);
    const [
      members,
      currentMinistries,
      personalInfos,
      spiritualJourneys,
      serviceProfiles,
      desiredMinistries,
      serviceAvailabilities,
      professionalProfiles,
      practicalSkills,
      finalNotes,
    ] = await Promise.all([
      this.memberRepository.findByIds(memberIds),
      this.memberMinistryRepository.findByChurchId(churchId),
      this.personalInfoRepository.findByChurchId(churchId),
      this.spiritualJourneyRepository.findByChurchId(churchId),
      this.serviceProfileRepository.findByChurchId(churchId),
      this.ministryInterestRepository.findByChurchId(churchId),
      this.serviceAvailabilityRepository.findByChurchId(churchId),
      this.professionalProfileRepository.findByChurchId(churchId),
      this.practicalSkillRepository.findByChurchId(churchId),
      this.finalNotesRepository.findByChurchId(churchId),
    ]);

    const personalByMember = indexByMemberId(personalInfos);
    const spiritualByMember = indexByMemberId(spiritualJourneys);
    const serviceByMember = indexByMemberId(serviceProfiles);
    const professionalByMember = indexByMemberId(professionalProfiles);
    const finalNotesByMember = indexByMemberId(finalNotes);
    const currentByMember = groupByMemberId(currentMinistries);
    const desiredByMember = groupByMemberId(desiredMinistries);
    const availabilityByMember = groupByMemberId(serviceAvailabilities);
    const skillsByMember = groupByMemberId(practicalSkills);

    return members.map((member) => ({
      member,
      personalInfo: personalByMember.get(member.id) ?? null,
      spiritualJourney: spiritualByMember.get(member.id) ?? null,
      serviceProfile: serviceByMember.get(member.id) ?? null,
      professionalProfile: professionalByMember.get(member.id) ?? null,
      finalNotes: finalNotesByMember.get(member.id) ?? null,
      currentMinistries: currentByMember.get(member.id) ?? [],
      desiredMinistries: desiredByMember.get(member.id) ?? [],
      serviceAvailabilities: availabilityByMember.get(member.id) ?? [],
      practicalSkills: skillsByMember.get(member.id) ?? [],
    }));
  }
}
