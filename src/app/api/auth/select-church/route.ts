import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { AllPermissions } from "@/domain/enums/Permission";
import { authContainer } from "@/infra/di";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";

interface SessionPayload {
  userId: string;
  memberId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
  churchId: string | null;
  churches: { churchId: string; roleId: string | null }[];
  permissions: string[];
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_AUTHENTICATED" } },
      { status: 401 },
    );
  }

  try {
    const tokenService = new JoseTokenJwtService();
    const rawSession = await tokenService.verifyToken(token);
    const session = rawSession as unknown as SessionPayload;

    const body = await request.json();
    const { churchId } = body;

    if (!churchId || typeof churchId !== "string") {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_CHURCH_ID" } },
        { status: 400 },
      );
    }

    // Recalcular permissões baseadas na igreja selecionada
    let permissions: string[] = [];

    if (session.isSuperAdmin) {
      // SuperAdmin tem todas as permissões
      permissions = AllPermissions;
    } else {
      // Buscar o MemberChurch do membro para esta igreja
      const memberChurch =
        await authContainer.memberChurchRepository.findByMemberIdAndChurchId(
          session.memberId,
          churchId,
        );

      if (memberChurch?.roleId) {
        // Buscar permissões apenas do role desta igreja
        const rolePermissions =
          await authContainer.rolePermissionRepository.findByRoleId(
            memberChurch.roleId,
          );
        permissions = rolePermissions.map(
          (rp: { permission: string }) => rp.permission,
        );
      }
    }

    const newSessionPayload = {
      ...session,
      churchId,
      permissions,
    };

    const newToken = await tokenService.generateToken(newSessionPayload);

    cookieStore.set("session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      ok: true,
      value: { churchId },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_SESSION" } },
      { status: 401 },
    );
  }
}
