"use client";

import { toBlob } from "html-to-image";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { ScaleShareCard } from "../components/ScaleShareCard";
import type { ShareScaleMemberView, ShareScaleView } from "../types/shareScale";

interface ScaleDetailResponse {
  ok: boolean;
  value?: {
    scale: {
      id: string;
      serviceId: string;
      ministryId: string;
      notes: string | null;
      members: Array<{ memberId: string; ministryRoleId: string }>;
    };
  };
}

interface ServiceResponse {
  ok: boolean;
  value?: {
    services: Array<{ id: string; title: string; date: string; time: string }>;
  };
}

interface MinistriesResponse {
  ok: boolean;
  value?: {
    ministries: Array<{ id: string; name: string }>;
  };
}

interface MinistryResponse {
  ok: boolean;
  value?: {
    ministry: {
      roles: Array<{ id: string; name: string }>;
    };
  };
}

interface MembersResponse {
  ok: boolean;
  value?: {
    members: Array<{ id: string; fullName: string }>;
  };
}

interface BuildShareScaleDataInput {
  scaleId: string;
  churchId: string;
  churchName: string;
}

function getFormattedDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" });
  const shortDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${dayName} ${shortDate}`;
}

async function buildShareScaleData({
  scaleId,
  churchId,
  churchName,
}: BuildShareScaleDataInput): Promise<ShareScaleView> {
  const scaleResponse = await fetch(`/api/scales/${scaleId}`);
  const scaleData = (await scaleResponse.json()) as ScaleDetailResponse;

  if (!scaleData.ok || !scaleData.value) {
    throw new Error("Não foi possível carregar a escala");
  }

  const scale = scaleData.value.scale;

  const [servicesResponse, ministriesResponse, ministryResponse, membersResponse] =
    await Promise.all([
      fetch(`/api/services?churchId=${churchId}`),
      fetch(`/api/ministries?churchId=${churchId}`),
      fetch(`/api/ministries/${scale.ministryId}`),
      fetch(`/api/members?churchId=${churchId}&ministryId=${scale.ministryId}`),
    ]);

  const servicesData = (await servicesResponse.json()) as ServiceResponse;
  const ministriesData = (await ministriesResponse.json()) as MinistriesResponse;
  const ministryData = (await ministryResponse.json()) as MinistryResponse;
  const membersData = (await membersResponse.json()) as MembersResponse;

  const service = servicesData.value?.services.find((item) => item.id === scale.serviceId);
  const ministry = ministriesData.value?.ministries.find(
    (item) => item.id === scale.ministryId,
  );

  const rolesMap = new Map(
    (ministryData.value?.ministry.roles ?? []).map((role) => [role.id, role.name]),
  );

  const membersMap = new Map(
    (membersData.value?.members ?? []).map((member) => [member.id, member.fullName]),
  );

  const members: ShareScaleMemberView[] = scale.members.map((member) => ({
    memberName: membersMap.get(member.memberId) ?? "Membro não encontrado",
    roleName: rolesMap.get(member.ministryRoleId) ?? "Função não encontrada",
  }));

  return {
    scaleId: scale.id,
    churchName,
    serviceTitle: service?.title ?? "Culto não encontrado",
    serviceDateLabel: service ? getFormattedDateLabel(service.date) : "Data não encontrada",
    serviceTime: service?.time ?? "Horário não encontrado",
    ministryName: ministry?.name ?? "Ministério não encontrado",
    notes: scale.notes,
    members,
  };
}

function downloadFile(file: File): void {
  const fileUrl = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = fileUrl;
  anchor.download = file.name;
  anchor.click();
  URL.revokeObjectURL(fileUrl);
}

async function renderShareScaleImage(data: ShareScaleView): Promise<File> {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.top = "-20000px";
  host.style.left = "-20000px";
  host.style.pointerEvents = "none";
  host.style.opacity = "0";
  document.body.appendChild(host);

  const root = createRoot(host);

  try {
    root.render(<ScaleShareCard data={data} />);
    await new Promise((resolve) => setTimeout(resolve, 80));

    const renderTarget = host.firstElementChild as HTMLElement | null;

    if (!renderTarget) {
      throw new Error("Não foi possível preparar imagem da escala");
    }

    const blob = await toBlob(renderTarget, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    if (!blob) {
      throw new Error("Não foi possível gerar a imagem da escala");
    }

    const fileName = `escala-${data.serviceDateLabel.replace(/\s+/g, "-").toLowerCase()}.png`;

    return new File([blob], fileName, { type: "image/png" });
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}

interface ShareScaleImageInput {
  scaleId: string;
  churchId: string;
  churchName: string;
}

export function useShareScaleImage() {
  const shareScaleImage = async ({
    scaleId,
    churchId,
    churchName,
  }: ShareScaleImageInput): Promise<void> => {
    try {
      const shareData = await buildShareScaleData({
        scaleId,
        churchId,
        churchName,
      });

      const imageFile = await renderShareScaleImage(shareData);
      const message = `Escala publicada - ${shareData.ministryName} - ${shareData.serviceDateLabel} ${shareData.serviceTime}`;

      if (navigator.share && navigator.canShare?.({ files: [imageFile] })) {
        await navigator.share({
          title: "Escala publicada",
          text: message,
          files: [imageFile],
        });
        toast.success("Imagem da escala compartilhada");
        return;
      }

      downloadFile(imageFile);
      toast.success("Imagem gerada e baixada. Você pode enviar no WhatsApp.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a imagem da escala";

      toast.error(message);
    }
  };

  return {
    shareScaleImage,
  };
}
