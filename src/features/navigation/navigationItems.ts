import {
  Building2,
  HeartHandshake,
  Home,
  type LucideIcon,
  Users,
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
  churchId?: string | null;
}): NavigationItem[] {
  const permissions = input.permissions ?? [];
  const canReadChurches =
    input.isSuperAdmin || permissions.includes(Permission.CHURCH_READ);
  const canReadMembers =
    Boolean(input.churchId) &&
    (input.isSuperAdmin || permissions.includes(Permission.MEMBER_READ));
  const canReadMinistries =
    Boolean(input.churchId) &&
    (input.isSuperAdmin || permissions.includes(Permission.MINISTRY_READ));

  return [
    { href: "/home", label: "Início", icon: Home },
    ...(canReadChurches
      ? [{ href: "/churches", label: "Igrejas", icon: Building2 }]
      : []),
    ...(canReadMembers
      ? [{ href: "/members", label: "Membros", icon: Users }]
      : []),
    ...(canReadMinistries
      ? [{ href: "/ministries", label: "Ministérios", icon: HeartHandshake }]
      : []),
  ];
}
