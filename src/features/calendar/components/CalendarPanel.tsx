"use client";

import type { Dispatch, SetStateAction } from "react";
import { ScaleFormSheet } from "@/features/calendar/components/ScaleFormSheet";
import { ServiceScalesSection } from "@/features/calendar/components/ServiceScalesSection";
import { useServiceScales } from "@/features/calendar/hooks/useServiceScales";
import { ServiceFormSheet } from "@/features/services/components/ServiceFormSheet";
import type { ServiceListItem } from "@/features/services/hooks/useServices";

export type PanelState =
  | { mode: "closed" }
  | { mode: "create-service"; date: string }
  | { mode: "service-details"; serviceId: string }
  | { mode: "edit-service"; serviceId: string }
  | { mode: "create-scale"; serviceId: string }
  | { mode: "edit-scale"; serviceId: string; scaleId: string };

interface CalendarPanelProps {
  panel: PanelState;
  setPanel: Dispatch<SetStateAction<PanelState>>;
  services: ServiceListItem[];
  canCreateService: boolean;
  canDeleteService: boolean;
  canViewScales: boolean;
  canReadScales: boolean;
  canWriteScales: boolean;
  canDeleteScales: boolean;
  refreshServices: () => Promise<unknown>;
  deleteService: (serviceId: string) => Promise<boolean>;
}

export function CalendarPanel({
  panel,
  setPanel,
  services,
  canCreateService,
  canDeleteService,
  canViewScales,
  canReadScales,
  canWriteScales,
  canDeleteScales,
  refreshServices,
  deleteService,
}: CalendarPanelProps) {
  const activeServiceId = getActiveServiceId(panel);
  const selectedService = activeServiceId
    ? services.find((service) => service.id === activeServiceId)
    : undefined;
  const scaleData = useServiceScales(activeServiceId);

  const handleServiceSuccess = async (_message: string, serviceId?: string) => {
    await refreshServices();
    setPanel(
      serviceId ? { mode: "service-details", serviceId } : { mode: "closed" },
    );
  };

  const handleScaleSuccess = async () => {
    if (!activeServiceId) return;
    await scaleData.refresh();
    setPanel({ mode: "service-details", serviceId: activeServiceId });
  };

  return (
    <>
      <ServiceFormSheet
        open={isServicePanelOpen(panel)}
        mode={getServicePanelMode(panel)}
        serviceId={activeServiceId}
        initialDate={panel.mode === "create-service" ? panel.date : undefined}
        service={selectedService}
        onOpenChange={(open) => !open && setPanel({ mode: "closed" })}
        onSuccess={handleServiceSuccess}
        onEdit={
          canCreateService && panel.mode === "service-details"
            ? () => setPanel({ mode: "edit-service", serviceId: activeServiceId ?? "" })
            : undefined
        }
        detailsContent={
          canViewScales && activeServiceId ? (
            <ServiceScalesSection
              scales={scaleData.scales}
              isLoading={scaleData.isLoading}
              error={scaleData.error}
              canCreate={canWriteScales}
              canEdit={canWriteScales}
              canDelete={canDeleteScales}
              canShare={canReadScales}
              onCreate={() => setPanel({ mode: "create-scale", serviceId: activeServiceId })}
              onEdit={(scaleId) =>
                setPanel({ mode: "edit-scale", serviceId: activeServiceId, scaleId })
              }
              onDelete={scaleData.deleteScale}
              onRefresh={scaleData.refresh}
            />
          ) : null
        }
        onDelete={canDeleteService ? deleteService : undefined}
      />
      <ScaleFormSheet
        open={isScalePanelOpen(panel)}
        mode={panel.mode === "edit-scale" ? "edit" : "create"}
        serviceId={getScaleServiceId(panel)}
        scaleId={panel.mode === "edit-scale" ? panel.scaleId : undefined}
        onBack={() =>
          activeServiceId && setPanel({ mode: "service-details", serviceId: activeServiceId })
        }
        onSuccess={handleScaleSuccess}
      />
    </>
  );
}

function getActiveServiceId(panel: PanelState): string | undefined {
  if (
    panel.mode === "service-details" ||
    panel.mode === "edit-service" ||
    panel.mode === "create-scale" ||
    panel.mode === "edit-scale"
  ) {
    return panel.serviceId;
  }
  return undefined;
}

function isServicePanelOpen(panel: PanelState) {
  return ["create-service", "edit-service", "service-details"].includes(panel.mode);
}

function getServicePanelMode(panel: PanelState): "create" | "edit" | "details" {
  if (panel.mode === "service-details") return "details";
  return panel.mode === "edit-service" ? "edit" : "create";
}

function isScalePanelOpen(panel: PanelState) {
  return panel.mode === "create-scale" || panel.mode === "edit-scale";
}

function getScaleServiceId(panel: PanelState) {
  return isScalePanelOpen(panel) ? panel.serviceId : "";
}
