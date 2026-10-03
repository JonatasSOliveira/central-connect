import type { ScaleGenerationPlan } from "@/modules/scales/domain/types/scale-generation-types";

export type ScaleGenerationPreviewDTO = ScaleGenerationPlan & {
  ministries: (ScaleGenerationPlan["ministries"][number] & {
    ministryName: string;
    roles: (ScaleGenerationPlan["ministries"][number]["roles"][number] & {
      roleName: string;
      assignments: (ScaleGenerationPlan["ministries"][number]["roles"][number]["assignments"][number] & {
        memberName: string;
      })[];
    })[];
  })[];
};
