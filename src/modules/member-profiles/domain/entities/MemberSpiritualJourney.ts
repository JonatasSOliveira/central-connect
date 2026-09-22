import type { AcceptedJesusStatus } from "@/shared/domain/enums/AcceptedJesusStatus";
import type { ChurchAttendanceTime } from "@/shared/domain/enums/ChurchAttendanceTime";
import type { DiscipleshipStatus } from "@/shared/domain/enums/DiscipleshipStatus";
import type { OfficialMemberStatus } from "@/shared/domain/enums/OfficialMemberStatus";
import type { SmallGroupStatus } from "@/shared/domain/enums/SmallGroupStatus";
import type { WaterBaptismStatus } from "@/shared/domain/enums/WaterBaptismStatus";
import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class MemberSpiritualJourney extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _churchId: string;
  protected readonly _acceptedJesus: AcceptedJesusStatus;
  protected readonly _waterBaptized: WaterBaptismStatus;
  protected readonly _baptismDetails: string | null;
  protected readonly _discipleshipStatus: DiscipleshipStatus;
  protected readonly _churchAttendanceTime: ChurchAttendanceTime;
  protected readonly _smallGroupStatus: SmallGroupStatus;
  protected readonly _officialMemberStatus: OfficialMemberStatus;

  constructor(params: MemberSpiritualJourneyParams) {
    super(params);
    this._memberId = params.memberId;
    this._churchId = params.churchId;
    this._acceptedJesus = params.acceptedJesus;
    this._waterBaptized = params.waterBaptized;
    this._baptismDetails = params.baptismDetails ?? null;
    this._discipleshipStatus = params.discipleshipStatus;
    this._churchAttendanceTime = params.churchAttendanceTime;
    this._smallGroupStatus = params.smallGroupStatus;
    this._officialMemberStatus = params.officialMemberStatus;
  }

  get memberId(): string {
    return this._memberId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get acceptedJesus(): AcceptedJesusStatus {
    return this._acceptedJesus;
  }

  get waterBaptized(): WaterBaptismStatus {
    return this._waterBaptized;
  }

  get baptismDetails(): string | null {
    return this._baptismDetails;
  }

  get discipleshipStatus(): DiscipleshipStatus {
    return this._discipleshipStatus;
  }

  get churchAttendanceTime(): ChurchAttendanceTime {
    return this._churchAttendanceTime;
  }

  get smallGroupStatus(): SmallGroupStatus {
    return this._smallGroupStatus;
  }

  get officialMemberStatus(): OfficialMemberStatus {
    return this._officialMemberStatus;
  }
}

export interface MemberSpiritualJourneyParams extends AuditableEntityParams {
  memberId: string;
  churchId: string;
  acceptedJesus: AcceptedJesusStatus;
  waterBaptized: WaterBaptismStatus;
  baptismDetails?: string | null;
  discipleshipStatus: DiscipleshipStatus;
  churchAttendanceTime: ChurchAttendanceTime;
  smallGroupStatus: SmallGroupStatus;
  officialMemberStatus: OfficialMemberStatus;
}
