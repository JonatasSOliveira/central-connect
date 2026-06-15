import { GetMemberProfile } from "@/application/use-cases/member-profile/GetMemberProfile";
import { ListMemberProfiles } from "@/application/use-cases/member-profile/ListMemberProfiles";
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
import { MemberChurchFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberChurchFirebaseRepository";
import { MemberFinalNotesFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberFinalNotesFirebaseRepository";
import { MemberFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberFirebaseRepository";
import { MemberMinistryFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberMinistryFirebaseRepository";
import { MemberMinistryInterestFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberMinistryInterestFirebaseRepository";
import { MemberPersonalInfoFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberPersonalInfoFirebaseRepository";
import { MemberPracticalSkillFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberPracticalSkillFirebaseRepository";
import { MemberProfessionalProfileFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberProfessionalProfileFirebaseRepository";
import { MemberServiceAvailabilityFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberServiceAvailabilityFirebaseRepository";
import { MemberServiceProfileFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberServiceProfileFirebaseRepository";
import { MemberSpiritualJourneyFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberSpiritualJourneyFirebaseRepository";
import { MinistryFirebaseRepository } from "@/infra/firebase-admin/repositories/MinistryFirebaseRepository";

class MemberProfileContainer {
  private static _memberRepository: IMemberRepository | null = null;
  private static _memberChurchRepository: IMemberChurchRepository | null = null;
  private static _memberMinistryRepository: IMemberMinistryRepository | null = null;
  private static _ministryRepository: IMinistryRepository | null = null;
  private static _personalInfoRepository: IMemberPersonalInfoRepository | null = null;
  private static _spiritualJourneyRepository: IMemberSpiritualJourneyRepository | null = null;
  private static _serviceProfileRepository: IMemberServiceProfileRepository | null = null;
  private static _ministryInterestRepository: IMemberMinistryInterestRepository | null = null;
  private static _serviceAvailabilityRepository: IMemberServiceAvailabilityRepository | null = null;
  private static _professionalProfileRepository: IMemberProfessionalProfileRepository | null = null;
  private static _practicalSkillRepository: IMemberPracticalSkillRepository | null = null;
  private static _finalNotesRepository: IMemberFinalNotesRepository | null = null;
  private static _listMemberProfiles: ListMemberProfiles | null = null;
  private static _getMemberProfile: GetMemberProfile | null = null;

  private constructor() {}

  static get memberRepository(): IMemberRepository {
    if (!MemberProfileContainer._memberRepository) {
      MemberProfileContainer._memberRepository = new MemberFirebaseRepository();
    }
    return MemberProfileContainer._memberRepository;
  }

  static get memberChurchRepository(): IMemberChurchRepository {
    if (!MemberProfileContainer._memberChurchRepository) {
      MemberProfileContainer._memberChurchRepository =
        new MemberChurchFirebaseRepository();
    }
    return MemberProfileContainer._memberChurchRepository;
  }

  static get memberMinistryRepository(): IMemberMinistryRepository {
    if (!MemberProfileContainer._memberMinistryRepository) {
      MemberProfileContainer._memberMinistryRepository =
        new MemberMinistryFirebaseRepository();
    }
    return MemberProfileContainer._memberMinistryRepository;
  }

  static get ministryRepository(): IMinistryRepository {
    if (!MemberProfileContainer._ministryRepository) {
      MemberProfileContainer._ministryRepository = new MinistryFirebaseRepository();
    }
    return MemberProfileContainer._ministryRepository;
  }

  static get personalInfoRepository(): IMemberPersonalInfoRepository {
    if (!MemberProfileContainer._personalInfoRepository) {
      MemberProfileContainer._personalInfoRepository =
        new MemberPersonalInfoFirebaseRepository();
    }
    return MemberProfileContainer._personalInfoRepository;
  }

  static get spiritualJourneyRepository(): IMemberSpiritualJourneyRepository {
    if (!MemberProfileContainer._spiritualJourneyRepository) {
      MemberProfileContainer._spiritualJourneyRepository =
        new MemberSpiritualJourneyFirebaseRepository();
    }
    return MemberProfileContainer._spiritualJourneyRepository;
  }

  static get serviceProfileRepository(): IMemberServiceProfileRepository {
    if (!MemberProfileContainer._serviceProfileRepository) {
      MemberProfileContainer._serviceProfileRepository =
        new MemberServiceProfileFirebaseRepository();
    }
    return MemberProfileContainer._serviceProfileRepository;
  }

  static get ministryInterestRepository(): IMemberMinistryInterestRepository {
    if (!MemberProfileContainer._ministryInterestRepository) {
      MemberProfileContainer._ministryInterestRepository =
        new MemberMinistryInterestFirebaseRepository();
    }
    return MemberProfileContainer._ministryInterestRepository;
  }

  static get serviceAvailabilityRepository(): IMemberServiceAvailabilityRepository {
    if (!MemberProfileContainer._serviceAvailabilityRepository) {
      MemberProfileContainer._serviceAvailabilityRepository =
        new MemberServiceAvailabilityFirebaseRepository();
    }
    return MemberProfileContainer._serviceAvailabilityRepository;
  }

  static get professionalProfileRepository(): IMemberProfessionalProfileRepository {
    if (!MemberProfileContainer._professionalProfileRepository) {
      MemberProfileContainer._professionalProfileRepository =
        new MemberProfessionalProfileFirebaseRepository();
    }
    return MemberProfileContainer._professionalProfileRepository;
  }

  static get practicalSkillRepository(): IMemberPracticalSkillRepository {
    if (!MemberProfileContainer._practicalSkillRepository) {
      MemberProfileContainer._practicalSkillRepository =
        new MemberPracticalSkillFirebaseRepository();
    }
    return MemberProfileContainer._practicalSkillRepository;
  }

  static get finalNotesRepository(): IMemberFinalNotesRepository {
    if (!MemberProfileContainer._finalNotesRepository) {
      MemberProfileContainer._finalNotesRepository =
        new MemberFinalNotesFirebaseRepository();
    }
    return MemberProfileContainer._finalNotesRepository;
  }

  static get listMemberProfiles(): ListMemberProfiles {
    if (!MemberProfileContainer._listMemberProfiles) {
      MemberProfileContainer._listMemberProfiles = new ListMemberProfiles(
        MemberProfileContainer.memberRepository,
        MemberProfileContainer.memberChurchRepository,
        MemberProfileContainer.memberMinistryRepository,
        MemberProfileContainer.ministryRepository,
        MemberProfileContainer.personalInfoRepository,
        MemberProfileContainer.spiritualJourneyRepository,
        MemberProfileContainer.serviceProfileRepository,
        MemberProfileContainer.ministryInterestRepository,
        MemberProfileContainer.serviceAvailabilityRepository,
        MemberProfileContainer.professionalProfileRepository,
        MemberProfileContainer.practicalSkillRepository,
        MemberProfileContainer.finalNotesRepository,
      );
    }
    return MemberProfileContainer._listMemberProfiles;
  }

  static get getMemberProfile(): GetMemberProfile {
    if (!MemberProfileContainer._getMemberProfile) {
      MemberProfileContainer._getMemberProfile = new GetMemberProfile(
        MemberProfileContainer.memberRepository,
        MemberProfileContainer.memberChurchRepository,
        MemberProfileContainer.memberMinistryRepository,
        MemberProfileContainer.ministryRepository,
        MemberProfileContainer.personalInfoRepository,
        MemberProfileContainer.spiritualJourneyRepository,
        MemberProfileContainer.serviceProfileRepository,
        MemberProfileContainer.ministryInterestRepository,
        MemberProfileContainer.serviceAvailabilityRepository,
        MemberProfileContainer.professionalProfileRepository,
        MemberProfileContainer.practicalSkillRepository,
        MemberProfileContainer.finalNotesRepository,
      );
    }
    return MemberProfileContainer._getMemberProfile;
  }
}

export const memberProfileContainer = MemberProfileContainer;
