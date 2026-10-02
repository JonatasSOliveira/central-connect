import { readFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";
import type {
  IScaleShareImageGenerator,
  ScaleShareImageData,
} from "@/modules/scales/application/ports/IScaleShareImageGenerator";

const colors = {
  background: "#111827",
  card: "#1f2937",
  border: "#374151",
  foreground: "#ffffff",
  muted: "#9ca3af",
  primary: "#16a34a",
  primaryLight: "#dcfce7",
};

const typography = {
  eyebrow: 20,
  title: 44,
  subtitle: 28,
  metadata: 24,
  section: 18,
  body: 26,
  role: 30,
  member: 26,
};

const roleLayout = {
  titleBaseline: 44,
  firstMemberBaseline: 100,
  memberLineHeight: 52,
  bottomPadding: 28,
};

let logoDataUriPromise: Promise<string> | null = null;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function text(
  value: string,
  x: number,
  y: number,
  size: number,
  fill = colors.foreground,
  weight = 400,
): string {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial, sans-serif" font-size="${size}px" font-weight="${weight}">${escapeXml(value)}</text>`;
}

async function loadLogoDataUri(): Promise<string> {
  logoDataUriPromise ??= readFile(
    join(process.cwd(), "public", "logo-central-redonda.svg"),
    "utf8",
  )
    .then((svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`)
    .catch(() => "");

  return logoDataUriPromise;
}

export class ScaleShareImageGenerator implements IScaleShareImageGenerator {
  async generate(data: ScaleShareImageData): Promise<Uint8Array> {
    const width = 1080;
    const logoDataUri = await loadLogoDataUri();
    const roleHeight = data.roles.reduce(
      (total, role) =>
        total +
        roleLayout.firstMemberBaseline +
        Math.max(role.memberNames.length - 1, 0) * roleLayout.memberLineHeight +
        roleLayout.bottomPadding,
      0,
    );
    const notesHeight = data.notes ? 112 : 0;
    const height = Math.max(1260, 540 + roleHeight + notesHeight);
    const parts: string[] = [
      `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`,
      `<rect width="${width}" height="${height}" fill="${colors.background}"/>`,
      `<rect x="48" y="48" width="984" height="320" rx="28" fill="${colors.primary}"/>`,
      text("ESCALA", 92, 108, typography.eyebrow, colors.primaryLight, 700),
      text(`Escala de ${data.ministryName}`, 92, 172, typography.title, colors.foreground, 700),
      text(data.serviceTitle, 92, 228, typography.subtitle, colors.foreground, 500),
      text(
        `${data.serviceDateLabel} · ${data.serviceTime}`,
        92,
        274,
        typography.metadata,
        colors.primaryLight,
        700,
      ),
      text(data.churchName, 92, 316, typography.section, colors.primaryLight, 400),
    ];

    if (logoDataUri) {
      parts.push(
        `<image href="${logoDataUri}" x="928" y="78" width="76" height="76" preserveAspectRatio="xMidYMid meet"/>`,
      );
    }

    parts.push(
      `<rect x="48" y="400" width="984" height="96" rx="22" fill="${colors.card}" stroke="${colors.border}" stroke-width="2"/>`,
      text("COMO LER A ESCALA", 84, 438, typography.section, colors.primaryLight, 700),
      text("Procure seu nome na função correspondente.", 84, 474, typography.body, colors.foreground, 500),
    );

    let y = 520;

    if (data.notes) {
      parts.push(
        `<rect x="48" y="${y}" width="984" height="94" rx="22" fill="${colors.card}" stroke="${colors.border}" stroke-width="2"/>`,
        text("OBSERVAÇÕES", 84, y + 36, typography.section, colors.primaryLight, 700),
        text(data.notes.slice(0, 110), 84, y + 70, typography.section, colors.muted, 400),
      );
      y += 112;
    }

    for (const role of data.roles) {
      const memberCount = Math.max(role.memberNames.length, 1);
      const cardHeight =
        roleLayout.firstMemberBaseline +
        (memberCount - 1) * roleLayout.memberLineHeight +
        roleLayout.bottomPadding;
      parts.push(
        `<rect x="48" y="${y}" width="984" height="${cardHeight}" rx="22" fill="${colors.card}" stroke="${colors.border}" stroke-width="2"/>`,
        text(role.name, 84, y + roleLayout.titleBaseline, typography.role, colors.primaryLight, 700),
      );

      role.memberNames.forEach((memberName, index) => {
        parts.push(
          text(
            `• ${memberName}`,
            100,
            y + roleLayout.firstMemberBaseline + index * roleLayout.memberLineHeight,
            typography.member,
            colors.foreground,
            500,
          ),
        );
      });

      y += cardHeight + 18;
    }

    parts.push("</svg>");

    return sharp(Buffer.from(parts.join(""))).png().toBuffer();
  }
}
