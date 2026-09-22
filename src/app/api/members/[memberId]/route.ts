import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

const handlers = getApplication().members.httpHandlers.member;
interface RouteParams {
  params: Promise<{ memberId: string }>;
}
export async function GET(request: NextRequest, { params }: RouteParams) {
  return handlers.GET(request, (await params).memberId);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return handlers.PUT(request, (await params).memberId);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return handlers.DELETE(request, (await params).memberId);
}
