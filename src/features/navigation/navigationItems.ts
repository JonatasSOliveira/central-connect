import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Home,
  type LucideIcon,
  Menu,
} from "lucide-react";
import { Permission } from "@/shared/domain/enums/Permission";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function getNavigationItems(input: {
  isSuperAdmin?: boolean;
  permissions?: string[];
}): NavigationItem[] {
  const permissions = input.permissions ?? [];
  const canManageScales =
    input.isSuperAdmin || permissions.includes(Permission.SCALE_READ);
  const canReadAttendance =
    input.isSuperAdmin ||
    permissions.includes(Permission.SCALE_ATTENDANCE_READ);

  return [
    { href: "/home", label: "Início", icon: Home },
    { href: "/my-scales", label: "Minhas escalas", icon: CalendarDays },
    ...(canManageScales
      ? [{ href: "/scales", label: "Gestão", icon: ClipboardList }]
      : []),
    ...(canReadAttendance
      ? [
          {
            href: "/scale-attendances",
            label: "Chamadas",
            icon: ClipboardCheck,
          },
        ]
      : []),
    { href: "/more", label: "Mais", icon: Menu },
  ];
}
