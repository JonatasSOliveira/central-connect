"use client";

import { Eye } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { ChipGroup } from "@/components/ui/chip-group";
import type { ReadonlyChurch } from "@/features/members/hooks/useMemberForm";

interface ReadonlyChurchListProps {
  churches: ReadonlyChurch[];
  title?: string;
  showTitle?: boolean;
}

export function ReadonlyChurchList({
  churches,
  title = "Associações",
  showTitle = true,
}: ReadonlyChurchListProps) {
  if (churches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {showTitle && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Eye className="w-3 h-3" />
          <span>{title}</span>
        </div>
      )}
      <div className="space-y-1.5">
        {churches.map((church) => (
          <div
            key={church.churchId}
            className="flex flex-col gap-1.5 px-3 py-2 bg-muted/30 rounded-lg text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium truncate flex-1">
                {church.churchName}
              </span>
              <span className="text-muted-foreground truncate max-w-[100px]">
                {church.roleName}
              </span>
            </div>
            {church.ministryIds.length > 0 && (
              <ChipGroup className="ml-0">
                {church.ministryIds.map((id) => (
                  <Chip key={id} variant="muted">
                    {id}
                  </Chip>
                ))}
              </ChipGroup>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
