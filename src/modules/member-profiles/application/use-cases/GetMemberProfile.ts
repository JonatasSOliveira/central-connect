import type { IMemberFinalNotesRepository } from "@/modules/member-profiles/application/ports/IMemberFinalNotesRepository";
import type { IMemberPersonalInfoRepository } from "@/modules/member-profiles/application/ports/IMemberPersonalInfoRepository";
import type { IMemberPracticalSkillRepository } from "@/modules/member-profiles/application/ports/IMemberPracticalSkillRepository";
import type { IMemberProfessionalProfileRepository } from "@/modules/member-profiles/application/ports/IMemberProfessionalProfileRepository";
import type { IMemberServiceAvailabilityRepository } from "@/modules/member-profiles/application/ports/IMemberServiceAvailabilityRepository";
import type { IMemberServiceProfileRepository } from "@/modules/member-profiles/application/ports/IMemberServiceProfileRepository";
import type { IMemberSpiritualJourneyRepository } from "@/modules/member-profiles/application/ports/IMemberSpiritualJourneyRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryInterestRepository } from "@/modules/members/application/ports/IMemberMinistryInterestRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type { MemberProfileDetailDTO } from "../dtos/member-profile/MemberProfileDTO";
import { toMemberProfileDetail } from "../services/memberProfileMapping";

export type GetMemberProfileInput = {
  churchId: string;
  memberId: string;
};

export class GetMemberProfile extends BaseUseCase<
  GetMemberProfileInput,
  MemberProfileDetailDTO
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
    input: GetMemberProfileInput,
  ): Promise<Result<MemberProfileDetailDTO>> {
    try {
      const [member, memberChurch] = await Promise.all([
        this.memberRepository.findById(input.memberId),
        this.memberChurchRepository.findByMemberIdAndChurchId(
          input.memberId,
          input.churchId,
        ),
      ]);

      if (!member || !memberChurch) {
        return {
          ok: false,
          error: {
            code: "MEMBER_PROFILE_NOT_FOUND",
            message: "Perfil de membro nao encontrado",
          },
        };
      }

      const [
        currentMinistries,
        ministries,
        personalInfo,
        spiritualJourney,
        serviceProfile,
        desiredMinistries,
        serviceAvailabilities,
        professionalProfile,
        practicalSkills,
        finalNotes,
      ] = await Promise.all([
        this.memberMinistryRepository.findByMemberId(input.memberId),
        this.ministryRepository.findByChurchId(input.churchId),
        this.personalInfoRepository.findByMemberAndChurch(
          input.memberId,
          input.churchId,
        ),
        this.spiritualJourneyRepository.findByMemberAndChurch(
          input.memberId,
          input.churchId,
        ),
        this.serviceProfileRepository.findByMemberAndChurch(
          input.memberId,
          input.churchId,
        ),
        this.ministryInterestRepository.findByMemberAndChurch(
          input.memberId,
          input.churchId,
        ),
        this.serviceAvailabilityRepository.findByMemberAndChurch(
          input.memberId,
          input.churchId,
        ),
        this.professionalProfileRepository.findByMemberAndChurch(
          input.memberId,
          input.churchId,
        ),
        this.practicalSkillRepository.findByMemberAndChurch(
          input.memberId,
          input.churchId,
        ),
        this.finalNotesRepository.findByMemberAndChurch(
          input.memberId,
          input.churchId,
        ),
      ]);

      return {
        ok: true,
        value: toMemberProfileDetail(
          {
            member,
            personalInfo,
            spiritualJourney,
            serviceProfile,
            professionalProfile,
            finalNotes,
            currentMinistries: currentMinistries.filter(
              (item) => item.churchId === input.churchId,
            ),
            desiredMinistries,
            serviceAvailabilities,
            practicalSkills,
          },
          ministries,
        ),
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "GET_MEMBER_PROFILE_FAILED",
          message: "Falha ao buscar perfil do membro",
        },
      };
    }
  }
}
