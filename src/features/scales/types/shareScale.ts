export interface ShareScaleMemberView {
  memberName: string;
  roleName: string;
}

export interface ShareScaleView {
  scaleId: string;
  churchName: string;
  serviceTitle: string;
  serviceDateLabel: string;
  serviceTime: string;
  ministryName: string;
  notes?: string | null;
  members: ShareScaleMemberView[];
}
