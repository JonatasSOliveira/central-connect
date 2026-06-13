import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";
import type { ServiceAvailabilitySlot } from "@/domain/enums/ServiceAvailabilitySlot";

export class MemberServiceAvailability extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _churchId: string;
  protected readonly _slot: ServiceAvailabilitySlot;

  constructor(params: MemberServiceAvailabilityParams) {
    super(params);
    this._memberId = params.memberId;
    this._churchId = params.churchId;
    this._slot = params.slot;
  }

  get memberId(): string {
    return this._memberId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get slot(): ServiceAvailabilitySlot {
    return this._slot;
  }
}

export interface MemberServiceAvailabilityParams
  extends AuditableEntityParams {
  memberId: string;
  churchId: string;
  slot: ServiceAvailabilitySlot;
}
