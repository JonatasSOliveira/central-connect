import type { ListMinistries } from "@/modules/ministries/application/use-cases/ListMinistries";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { AddMemberToScale } from "@/modules/scales/application/use-cases/AddMemberToScale";
import type { CreateScale } from "@/modules/scales/application/use-cases/CreateScale";
import type { DeleteScale } from "@/modules/scales/application/use-cases/DeleteScale";
import type { GetScale } from "@/modules/scales/application/use-cases/GetScale";
import type { GetScaleAttendance } from "@/modules/scales/application/use-cases/GetScaleAttendance";
import type { GetScaleAttendanceReport } from "@/modules/scales/application/use-cases/GetScaleAttendanceReport";
import type { ListMyScales } from "@/modules/scales/application/use-cases/ListMyScales";
import type { ListScaleAttendances } from "@/modules/scales/application/use-cases/ListScaleAttendances";
import type { ListScales } from "@/modules/scales/application/use-cases/ListScales";
import type { PublishScaleAttendance } from "@/modules/scales/application/use-cases/PublishScaleAttendance";
import type { RemoveMemberFromScale } from "@/modules/scales/application/use-cases/RemoveMemberFromScale";
import type { RunScheduledScaleGeneration } from "@/modules/scales/application/use-cases/RunScheduledScaleGeneration";
import type { SaveScaleAttendance } from "@/modules/scales/application/use-cases/SaveScaleAttendance";
import type { UpdateScale } from "@/modules/scales/application/use-cases/UpdateScale";
import type { ScaleNotificationResult } from "@/modules/scales/application/ports/IScaleNotificationService";

type Executable<T> = {
  execute: T extends { execute: infer Execute } ? Execute : never;
};

export interface ScalesHandlerDependencies {
  scale: {
    addMemberToScale: Executable<AddMemberToScale>;
    createScale: Executable<CreateScale>;
    deleteScale: Executable<DeleteScale>;
    getScale: Executable<GetScale>;
    getScaleAttendance: Executable<GetScaleAttendance>;
    getScaleAttendanceReport: Executable<GetScaleAttendanceReport>;
    listMyScales: Executable<ListMyScales>;
    listScaleAttendances: Executable<ListScaleAttendances>;
    listScales: Executable<ListScales>;
    publishScaleAttendance: Executable<PublishScaleAttendance>;
    removeMemberFromScale: Executable<RemoveMemberFromScale>;
    runScheduledScaleGeneration: Executable<RunScheduledScaleGeneration>;
    saveScaleAttendance: Executable<SaveScaleAttendance>;
    updateScale: Executable<UpdateScale>;
    scaleMemberRepository: Pick<
      IScaleMemberRepository,
      "findByScaleId" | "findByScaleIds"
    >;
  };
  notification: {
    notifyScaleMembers: { execute(input: unknown): Promise<unknown> };
    notifyPublishedScalesByDate: {
      execute(input: unknown): Promise<ScaleNotificationResult>;
    };
  };
  ministries: {
    listMinistries: Executable<ListMinistries>;
  };
}
