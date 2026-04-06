"use client";

import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

interface ScaleFilterProps {
  services: { id: string; title: string }[];
  ministries: { id: string; name: string }[];
  filters: { serviceId?: string; ministryId?: string };
  onApplyFilters: (filters: {
    serviceId?: string;
    ministryId?: string;
  }) => void;
}

export function ScaleFilter({
  services,
  ministries,
  filters,
  onApplyFilters,
}: ScaleFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localServiceId, setLocalServiceId] = useState(filters.serviceId ?? "");
  const [localMinistryId, setLocalMinistryId] = useState(
    filters.ministryId ?? "",
  );

  const hasActiveFilters = filters.serviceId || filters.ministryId;

  const handleApply = useCallback(() => {
    onApplyFilters({
      serviceId: localServiceId || undefined,
      ministryId: localMinistryId || undefined,
    });
    setShowFilters(false);
  }, [localServiceId, localMinistryId, onApplyFilters]);

  const handleClear = useCallback(() => {
    setLocalServiceId("");
    setLocalMinistryId("");
    onApplyFilters({});
    setShowFilters(false);
  }, [onApplyFilters]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showFilters ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        Filtros
        {hasActiveFilters && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
            ativo
          </span>
        )}
      </button>

      {showFilters && (
        <div className="space-y-3 pt-2 pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Culto</label>
              <select
                value={localServiceId}
                onChange={(e) => setLocalServiceId(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todos os cultos</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Ministério
              </label>
              <select
                value={localMinistryId}
                onChange={(e) => setLocalMinistryId(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todos os ministérios</option>
                {ministries.map((ministry) => (
                  <option key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleApply}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4 mr-1" />
              Aplicar
            </Button>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
