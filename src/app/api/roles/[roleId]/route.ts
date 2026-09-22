import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

const handlers = getApplication().roles.httpHandlers.role;

interface RouteParams {
  params: Promise<{ roleId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return handlers.GET(request, (await params).roleId);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return handlers.PUT(request, (await params).roleId);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return handlers.DELETE(request, (await params).roleId);
}
