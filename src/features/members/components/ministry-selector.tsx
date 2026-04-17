"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { MinistryListItemDTO } from "@/application/dtos/ministry/MinistryDTO";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ChipGroup } from "@/components/ui/chip-group";
import { FormSelect } from "@/components/ui/form-select";

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
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMinistryId, setSelectedMinistryId] = useState("");

  const selectedMinistryNames = selectedMinistryIds.map((id) => {
    const ministry = availableMinistries.find((m) => m.id === id);
    return ministry?.name || id;
  });

  const availableToSelect = availableMinistries.filter(
    (m) => !selectedMinistryIds.includes(m.id),
  );

  const handleAdd = () => {
    if (selectedMinistryId) {
      onAddMinistry(selectedMinistryId);
      setSelectedMinistryId("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setSelectedMinistryId("");
    setIsAdding(false);
  };

  const handleStartAdding = () => {
    setIsAdding(true);
    if (availableToSelect.length === 1) {
      setSelectedMinistryId(availableToSelect[0].id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Ministérios
        </span>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {selectedMinistryIds.length}
        </span>
      </div>

      <ChipGroup emptyMessage="Nenhum ministério selecionado">
        {selectedMinistryIds.map((id, index) => (
          <Chip
            key={id}
            onRemove={disabled ? undefined : () => onRemoveMinistry(index)}
            variant="primary"
          >
            {selectedMinistryNames[index]}
          </Chip>
        ))}
      </ChipGroup>

      {isAdding ? (
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
          <FormSelect
            label="Adicionar ministério"
            value={selectedMinistryId}
            onChange={(value) => setSelectedMinistryId(value)}
            options={availableToSelect.map((m) => ({
              value: m.id,
              label: m.name,
            }))}
            placeholder="Selecione"
            required
            disabled={isLoading || disabled}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={!selectedMinistryId || disabled}
              className="flex-1"
            >
              Adicionar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleStartAdding}
          disabled={
            disabled ||
            isLoading ||
            availableMinistries.length === 0 ||
            selectedMinistryIds.length >= availableMinistries.length
          }
          className="w-full h-9"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Ministério
        </Button>
      )}
    </div>
  );
}
