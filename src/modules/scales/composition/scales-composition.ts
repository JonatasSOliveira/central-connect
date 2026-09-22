import { createScalesInfrastructure } from "@/modules/scales/infrastructure/composition/scales-infrastructure";
import { listMyScales } from "@/modules/scales/presentation/http/handlers/my-scale-handlers";
import { createScaleAttendanceHandlers } from "@/modules/scales/presentation/http/handlers/scale-attendance-handlers";
import { createScaleGenerationHandlers } from "@/modules/scales/presentation/http/handlers/scale-generation-handlers";
import { createScaleHandlers } from "@/modules/scales/presentation/http/handlers/scale-handlers";
import { createScaleReportHandlers } from "@/modules/scales/presentation/http/handlers/scale-report-handlers";

export function createScalesComposition() {
  const dependencies = createScalesInfrastructure();

  return {
    dependencies,
    httpHandlers: {
      ...createScaleHandlers(dependencies),
      attendance: createScaleAttendanceHandlers(dependencies),
      reports: createScaleReportHandlers(dependencies),
      generation: createScaleGenerationHandlers(dependencies),
      myScales: {
        list: (request: Parameters<typeof listMyScales>[0]) =>
          listMyScales(request, dependencies),
      },
    },
  };
}

export type ScalesComposition = ReturnType<typeof createScalesComposition>;
