"use client";

import { Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberSelect } from "@/components/ui/member-select";
import type { MemberOption, MinistryRoleOption } from "../types";

interface SelectedMember {
  index: number;
  memberId: string;
  fieldId: string;
}

interface ScaleRoleCardProps {
  role: MinistryRoleOption;
  selectedMembers: SelectedMember[];
  availableMembers: MemberOption[];
  selectedMemberIds: string[];
  onAddMember: (memberId: string) => void;
  onRemoveMember: (index: number) => void;
  onRemoveRole: () => void;
}

export function ScaleRoleCard({
  role,
  selectedMembers,
  availableMembers,
  selectedMemberIds,
  onAddMember,
  onRemoveMember,
  onRemoveRole,
}: ScaleRoleCardProps) {
  const eligibleMembers = availableMembers.filter((member) =>
    member.ministryRoles.some((item) => item.ministryRoleId === role.id),
  );
  const selectableMembers = eligibleMembers.filter(
    (member) => !selectedMemberIds.includes(member.id),
  );
  const countLabel = `${selectedMembers.length} de ${role.requiredCount}`;

  return (
    <article className="rounded-xl border border-primary/20 bg-card p-4 shadow-[var(--shadow-soft-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {role.displayOrder}
            </span>
            <h3 className="font-semibold text-foreground">{role.name}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Ideal: {role.requiredCount} pessoa{role.requiredCount === 1 ? "" : "s"} · Escalados: {countLabel}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={onRemoveRole}
          aria-label={`Remover função ${role.name}`}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>

      {selectedMembers.length > 0 && (
        <ul className="mt-4 space-y-2" aria-label={`Membros em ${role.name}`}>
          {selectedMembers.map((member) => {
            const person = availableMembers.find((item) => item.id === member.memberId);
            return (
              <li key={member.fieldId} className="flex items-center justify-between gap-3 rounded-lg bg-primary/5 px-3 py-2 text-sm">
                <span className="font-medium text-foreground">{person?.fullName ?? "Membro selecionado"}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveMember(member.index)}
                >
                  <Minus aria-hidden="true" />
                  Remover
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4">
        <MemberSelect
          label="Adicionar membro"
          value=""
          onChange={onAddMember}
          members={selectableMembers}
          placeholder={selectableMembers.length > 0 ? "Selecione uma pessoa" : "Nenhuma pessoa disponível"}
          searchPlaceholder="Pesquisar pessoa..."
          emptyText="Nenhuma pessoa autorizada encontrada"
          disabled={selectableMembers.length === 0}
        />
      </div>

      {selectedMembers.length < role.requiredCount && (
        <p className="mt-3 text-xs text-muted-foreground">
          Ainda falta {role.requiredCount - selectedMembers.length} pessoa{role.requiredCount - selectedMembers.length === 1 ? "" : "s"} para atingir a quantidade ideal. Você pode salvar assim mesmo.
        </p>
      )}
    </article>
  );
}
