export interface ScaleShareRoleImageData {
  name: string;
  requiredCount: number;
  memberNames: string[];
}

export interface ScaleShareImageData {
  churchName: string;
  ministryName: string;
  serviceTitle: string;
  serviceDateLabel: string;
  serviceTime: string;
  notes: string | null;
  roles: ScaleShareRoleImageData[];
}

export interface IScaleShareImageGenerator {
  generate(data: ScaleShareImageData): Promise<Uint8Array>;
}
