import type { MemberProfileDetailDTO } from "@/application/dtos/member-profile/MemberProfileDTO";
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
import { toMemberProfileDetail } from "./memberProfileMapping";

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
