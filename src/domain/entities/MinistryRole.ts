import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export class MinistryRole extends BaseEntity {
  protected readonly _ministryId: string;
  protected readonly _name: string;
  protected readonly _requiredCount: number;
  protected readonly _createdByUserId: string | null;
  protected readonly _updatedByUserId: string | null;

  constructor(params: MinistryRoleParams) {
    super(params);
    this._ministryId = params.ministryId;
    this._name = params.name;
    this._requiredCount = params.requiredCount ?? 1;
    this._createdByUserId = params.createdByUserId ?? null;
    this._updatedByUserId = params.updatedByUserId ?? null;
  }

  get ministryId(): string {
    return this._ministryId;
  }

  get name(): string {
    return this._name;
  }

  get requiredCount(): number {
    return this._requiredCount;
  }

  get createdByUserId(): string | null {
    return this._createdByUserId;
  }

  get updatedByUserId(): string | null {
    return this._updatedByUserId;
  }
}

export interface MinistryRoleParams extends BaseEntityParams {
  ministryId: string;
  name: string;
  requiredCount?: number;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
}
