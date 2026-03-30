"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Permission, PermissionGroups } from "@/domain/enums/Permission";

interface PermissionSelectProps {
  value: Permission[];
  onChange: (value: Permission[]) => void;
  disabled?: boolean;
}

const permissionLabels: Record<Permission, string> = {
  [Permission.CHURCH_READ]: "Igreja: Leitura",
  [Permission.CHURCH_WRITE]: "Igreja: Escrita",
  [Permission.CHURCH_DELETE]: "Igreja: Excluir",
  [Permission.CHURCH_SELF_READ]: "Igreja: Leitura Própria",
  [Permission.CHURCH_SELF_WRITE]: "Igreja: Edição Própria",
  [Permission.MEMBER_READ]: "Membros: Leitura",
  [Permission.MEMBER_WRITE]: "Membros: Escrita",
  [Permission.MEMBER_DELETE]: "Membros: Excluir",
  [Permission.MEMBER_SELF_WRITE]: "Membros: Edição Própria",
  [Permission.SCHEDULE_READ]: "Escalas: Leitura",
  [Permission.SCHEDULE_WRITE]: "Escalas: Escrita",
  [Permission.SCHEDULE_DELETE]: "Escalas: Excluir",
  [Permission.ROLE_READ]: "Cargos do sistema: Leitura",
  [Permission.ROLE_WRITE]: "Cargos do sistema: Escrita",
  [Permission.ROLE_DELETE]: "Cargos do sistema: Excluir",
  [Permission.MINISTRY_READ]: "Ministérios: Leitura",
  [Permission.MINISTRY_WRITE]: "Ministérios: Escrita",
  [Permission.MINISTRY_DELETE]: "Ministérios: Excluir",
};

const groupLabels: Record<string, string> = {
  CHURCH: "Igreja",
  MEMBER: "Membros",
  SCHEDULE: "Escalas",
  ROLE: "Cargos do sistema",
  MINISTRY: "Ministérios",
};

export function PermissionSelect({
  value,
  onChange,
  disabled,
}: PermissionSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCount = value.length;
  const displayText =
    selectedCount === 0
      ? "Selecione as permissões"
      : `${selectedCount} permissões selecionadas`;

  const handleToggle = (permission: Permission) => {
    const newValue = value.includes(permission)
      ? value.filter((p) => p !== permission)
      : [...value, permission];
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="h-12 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 flex items-center justify-between font-normal md:h-8 md:px-2.5 md:py-1 md:text-sm"
        style={{ width: "100%", display: "flex" }}
      >
        <span className={selectedCount === 0 ? "text-muted-foreground" : ""}>
          {displayText}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto p-2">
          {Object.entries(PermissionGroups).map(([groupKey, permissions]) => (
            <div key={groupKey} className="mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                {groupLabels[groupKey]}
              </h3>
              {permissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md cursor-pointer"
                >
                  <Checkbox
                    checked={value.includes(permission)}
                    onCheckedChange={() => handleToggle(permission)}
                    disabled={disabled}
                  />
                  <span className="text-sm flex-1">
                    {permissionLabels[permission]}
                  </span>
                  {value.includes(permission) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </label>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
