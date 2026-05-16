import { NextResponse } from "next/server";
import { Permission } from "@/domain/enums/Permission";
import { scaleContainer } from "@/infra/di";
import { getChurchIdFromSession, validateSession } from "../_lib/auth";

interface MyScaleItem {
  scaleId: string;
  serviceDate: string;
  serviceTime: string;
  ministryName: string;
  ministryRoleName: string;
}

function isNonNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function GET() {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const canReadAll =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_READ);
  const canReadOwn =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_SELF_READ);

  if (!canReadAll && !canReadOwn) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para visualizar escalas",
        },
      },
      { status: 403 },
    );
  }

  const churchId = getChurchIdFromSession(user, null);

  if (!churchId) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NO_CHURCH_SELECTED",
          message: "Nenhuma igreja selecionada",
        },
      },
      { status: 400 },
    );
  }

  const scales = await scaleContainer.scaleRepository.findByChurchId(churchId);
  const scaleIds = scales.map((scale) => scale.id);

  if (scaleIds.length === 0) {
    return NextResponse.json(
      { ok: true, value: { currentAndFuture: [], past: [] } },
      { status: 200 },
    );
  }

  const scaleMembers = await scaleContainer.scaleMemberRepository.findByScaleIds(
    scaleIds,
  );
  const myScaleMembers = scaleMembers.filter(
    (scaleMember) => scaleMember.memberId === user.memberId,
  );

  if (myScaleMembers.length === 0) {
    return NextResponse.json(
      { ok: true, value: { currentAndFuture: [], past: [] } },
      { status: 200 },
    );
  }

  const scaleById = new Map(scales.map((scale) => [scale.id, scale]));

  const serviceIds = Array.from(
    new Set(
      myScaleMembers
        .map((scaleMember) => scaleById.get(scaleMember.scaleId)?.serviceId)
        .filter((serviceId): serviceId is string => Boolean(serviceId)),
    ),
  );

  const ministryIds = Array.from(
    new Set(
      myScaleMembers
        .map((scaleMember) => scaleById.get(scaleMember.scaleId)?.ministryId)
        .filter((ministryId): ministryId is string => Boolean(ministryId)),
    ),
  );

  const ministryRoleIds = Array.from(
    new Set(myScaleMembers.map((scaleMember) => scaleMember.ministryRoleId)),
  );

  const [services, ministries, ministryRoles] = await Promise.all([
    Promise.all(
      serviceIds.map((serviceId) => scaleContainer.serviceRepository.findById(serviceId)),
    ),
    Promise.all(
      ministryIds.map((ministryId) =>
        scaleContainer.ministryRepository.findById(ministryId),
      ),
    ),
    Promise.all(
      ministryRoleIds.map((ministryRoleId) =>
        scaleContainer.ministryRoleRepository.findById(ministryRoleId),
      ),
    ),
  ]);

  const serviceById = new Map(
    services.filter(isNonNullable).map((service) => [service.id, service]),
  );
  const ministryById = new Map(
    ministries
      .filter(isNonNullable)
      .map((ministry) => [ministry.id, ministry]),
  );
  const ministryRoleById = new Map(
    ministryRoles
      .filter(isNonNullable)
      .map((ministryRole) => [ministryRole.id, ministryRole]),
  );

  const today = startOfToday();

  const items: MyScaleItem[] = myScaleMembers
    .map((scaleMember) => {
      const scale = scaleById.get(scaleMember.scaleId);
      if (!scale || scale.status !== "published") {
        return null;
      }

      const service = serviceById.get(scale.serviceId);
      const ministry = ministryById.get(scale.ministryId);
      const ministryRole = ministryRoleById.get(scaleMember.ministryRoleId);

      if (!service || !ministry || !ministryRole) {
        return null;
      }

      return {
        scaleId: scale.id,
        serviceDate: service.date.toISOString(),
        serviceTime: service.time,
        ministryName: ministry.name,
        ministryRoleName: ministryRole.name,
      };
    })
    .filter((item): item is MyScaleItem => item !== null);

  const currentAndFuture = items
    .filter((item) => new Date(item.serviceDate) >= today)
    .sort(
      (a, b) =>
        new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime(),
    );

  const past = items
    .filter((item) => new Date(item.serviceDate) < today)
    .sort(
      (a, b) =>
        new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime(),
    );

  return NextResponse.json(
    {
      ok: true,
      value: {
        currentAndFuture,
        past,
      },
    },
    { status: 200 },
  );
}
