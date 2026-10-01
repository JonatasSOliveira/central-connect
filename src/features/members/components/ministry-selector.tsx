"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/chip";
import { ChipGroup } from "@/components/ui/chip-group";
import { MinistrySelect } from "@/components/ui/ministry-select";
import type { MinistryListItemDTO } from "@/modules/ministries/presentation/contracts/ministry/MinistryDTO";

interface MinistrySelectorProps {
  churchId: string;
  selectedMinistryIds: string[];
  availableMinistries: MinistryListItemDTO[];
  isLoading: boolean;
  onAddMinistry: (ministryId: string) => void;
  onRemoveMinistry: (index: number) => void;
  disabled?: boolean;
}

export function MinistrySelector({
  selectedMinistryIds,
  availableMinistries,
  isLoading,
  onAddMinistry,
  onRemoveMinistry,
  disabled = false,
}: MinistrySelectorProps) {
  const [selectedMinistryId, setSelectedMinistryId] = useState("");

  const selectedMinistryNames = selectedMinistryIds.map((id) => {
    const ministry = availableMinistries.find((m) => m.id === id);
    return ministry?.name || id;
  });

  const availableToSelect = availableMinistries.filter(
    (m) => !selectedMinistryIds.includes(m.id),
  );

  const handleMinistryChange = (ministryId: string) => {
    if (!ministryId) return;

    onAddMinistry(ministryId);
    setSelectedMinistryId("");
  };

  return (
    <div className="space-y-4 rounded-lg border border-primary/20 bg-background/70 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Ministérios em que participa
        </span>
        <span
          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
        >
          {selectedMinistryIds.length}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Selecione os ministérios em que esta pessoa atua.
      </p>

      <ChipGroup emptyMessage="Nenhum ministério selecionado ainda">
        {selectedMinistryIds.map((id, index) => (
          <Chip
            key={id}
            onRemove={disabled ? undefined : () => onRemoveMinistry(index)}
            aria-label={`Remover ${selectedMinistryNames[index]}`}
            variant="primary"
          >
            {selectedMinistryNames[index]}
          </Chip>
        ))}
      </ChipGroup>

      {availableToSelect.length > 0 ? (
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
          <MinistrySelect
            label="Selecione um ministério"
            value={selectedMinistryId}
            onChange={handleMinistryChange}
            ministries={availableToSelect.map((ministry) => ({
              id: ministry.id,
              name: ministry.name,
            }))}
            placeholder="Selecione um ministério"
            required
            disabled={isLoading || disabled}
          />
        </div>
      ) : (
        <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {availableMinistries.length === 0
            ? "Nenhum ministério disponível nesta igreja."
            : "Todos os ministérios disponíveis já foram adicionados."}
        </p>
      )}
    </div>
  );
}
