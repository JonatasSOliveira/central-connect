import { z } from "zod";
import { AcceptedJesusStatus } from "@/domain/enums/AcceptedJesusStatus";
import { ChurchAttendanceTime } from "@/domain/enums/ChurchAttendanceTime";
import { DiscipleshipStatus } from "@/domain/enums/DiscipleshipStatus";
import { OfficialMemberStatus } from "@/domain/enums/OfficialMemberStatus";
import { SmallGroupStatus } from "@/domain/enums/SmallGroupStatus";
import { WaterBaptismStatus } from "@/domain/enums/WaterBaptismStatus";

export const SelfSignupSpiritualJourneySchema = z
  .object({
    acceptedJesus: z.enum(AcceptedJesusStatus),
    waterBaptized: z.enum(WaterBaptismStatus),
    baptismDetails: z.string().optional().or(z.literal("")),
    discipleshipStatus: z.enum(DiscipleshipStatus),
    churchAttendanceTime: z.enum(ChurchAttendanceTime),
    smallGroupStatus: z.enum(SmallGroupStatus),
    officialMemberStatus: z.enum(OfficialMemberStatus),
  })
  .superRefine((data, ctx) => {
    if (
      data.waterBaptized === WaterBaptismStatus.Yes &&
      !data.baptismDetails?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o ano e a igreja do batismo",
        path: ["baptismDetails"],
      });
    }
  });

export type SelfSignupSpiritualJourneyDTO = z.infer<
  typeof SelfSignupSpiritualJourneySchema
>;
