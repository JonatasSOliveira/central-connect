"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { ChipGroup } from "@/components/ui/chip-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPhoneBrDynamic } from "@/shared/utils/phone";

interface SelfSignupFormStepProps {
  fullName: string;
  phone: string;
  onFullNameChange: (value: string) => void;
  ministryIds: string[];
  confirmNoMinistry: boolean;
  availableMinistries: { id: string; name: string }[];
  onToggleMinistry: (ministryId: string) => void;
  onConfirmNoMinistry: (value: boolean) => void;
}

export function SelfSignupFormStep({
  fullName,
  phone,
  onFullNameChange,
  ministryIds,
  confirmNoMinistry,
  availableMinistries,
  onToggleMinistry,
  onConfirmNoMinistry,
}: SelfSignupFormStepProps) {
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const [isAddingMinistry, setIsAddingMinistry] = useState(false);
  const [selectedMinistryId, setSelectedMinistryId] = useState("");

  useEffect(() => {
    fullNameRef.current?.focus();
  }, []);

  const availableToSelect = availableMinistries.filter(
    (m) => !ministryIds.includes(m.id),
  );

  const handleAddMinistry = () => {
    if (!selectedMinistryId) return;
    onToggleMinistry(selectedMinistryId);
    setSelectedMinistryId("");
    setIsAddingMinistry(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          ref={fullNameRef}
          id="fullName"
          value={fullName}
          onChange={(event) => onFullNameChange(event.target.value)}
          placeholder="Seu nome completo"
          autoComplete="name"
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phoneReadOnly">Telefone</Label>
        <Input
          id="phoneReadOnly"
          value={formatPhoneBrDynamic(phone)}
          readOnly
        />
      </div>

      {availableMinistries.length > 0 && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Ministérios que sirvo
            </span>
            {ministryIds.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {ministryIds.length}
              </span>
            )}
          </div>

          <ChipGroup emptyMessage="Nenhum ministério selecionado">
            {ministryIds.map((id) => {
              const ministry = availableMinistries.find((m) => m.id === id);
              return (
                <Chip
                  key={id}
                  onRemove={() => onToggleMinistry(id)}
                  variant="primary"
                >
                  {ministry?.name ?? id}
                </Chip>
              );
            })}
          </ChipGroup>

          {isAddingMinistry ? (
            <div className="space-y-3 bg-muted/30 rounded-lg p-3">
              <select
                value={selectedMinistryId}
                onChange={(e) => setSelectedMinistryId(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-[var(--shadow-soft-sm)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:text-disabled-foreground"
              >
                <option value="">Selecione um ministério</option>
                {availableToSelect.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingMinistry(false);
                    setSelectedMinistryId("");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddMinistry}
                  disabled={!selectedMinistryId}
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
              onClick={() => setIsAddingMinistry(true)}
              disabled={availableToSelect.length === 0}
              className="w-full h-9"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Ministério
            </Button>
          )}

          {ministryIds.length === 0 && (
            <label className="flex items-start gap-2 pt-1">
              <Checkbox
                checked={confirmNoMinistry}
                onCheckedChange={(checked) =>
                  onConfirmNoMinistry(checked === true)
                }
              />
              <span className="text-sm leading-5 text-foreground">
                Não sirvo em nenhum ministério no momento
              </span>
            </label>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        O e-mail será obtido pela autenticação do Google na próxima etapa.
      </p>
    </div>
  );
}
