import { AcceptedJesusStatus } from "@/domain/enums/AcceptedJesusStatus";
import { ChurchAttendanceTime } from "@/domain/enums/ChurchAttendanceTime";
import { DiscipleshipStatus } from "@/domain/enums/DiscipleshipStatus";
import { OfficialMemberStatus } from "@/domain/enums/OfficialMemberStatus";
import { SmallGroupStatus } from "@/domain/enums/SmallGroupStatus";
import { WaterBaptismStatus } from "@/domain/enums/WaterBaptismStatus";

export const acceptedJesusStatusLabels: Record<AcceptedJesusStatus, string> = {
  [AcceptedJesusStatus.Yes]: "Sim",
  [AcceptedJesusStatus.No]: "Não",
  [AcceptedJesusStatus.InProcess]: "Estou em processo",
};

export const waterBaptismStatusLabels: Record<WaterBaptismStatus, string> = {
  [WaterBaptismStatus.Yes]: "Sim",
  [WaterBaptismStatus.No]: "Não",
  [WaterBaptismStatus.WantsBaptism]: "Quero ser batizado",
};

export const discipleshipStatusLabels: Record<DiscipleshipStatus, string> = {
  [DiscipleshipStatus.Completed]: "Sim, concluído",
  [DiscipleshipStatus.InProcess]: "Estou em processo",
  [DiscipleshipStatus.NotYet]: "Ainda não",
  [DiscipleshipStatus.Unknown]: "Não sei o que é",
};

export const churchAttendanceTimeLabels: Record<ChurchAttendanceTime, string> =
  {
    [ChurchAttendanceTime.LessThan6Months]: "Menos de 6 meses",
    [ChurchAttendanceTime.SixMonthsToOneYear]: "De 6 meses a 1 ano",
    [ChurchAttendanceTime.OneToThreeYears]: "De 1 a 3 anos",
    [ChurchAttendanceTime.MoreThanThreeYears]: "Mais de 3 anos",
  };

export const smallGroupStatusLabels: Record<SmallGroupStatus, string> = {
  [SmallGroupStatus.Yes]: "Sim",
  [SmallGroupStatus.No]: "Não",
  [SmallGroupStatus.Interested]: "Tenho interesse em participar",
};

export const officialMemberStatusLabels: Record<OfficialMemberStatus, string> =
  {
    [OfficialMemberStatus.Yes]: "Sim",
    [OfficialMemberStatus.No]: "Não",
    [OfficialMemberStatus.InProcess]: "Em processo",
  };
