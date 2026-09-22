import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

const handlers = getApplication().churches.httpHandlers.church;
interface RouteParams {
  params: Promise<{ churchId: string }>;
}
export async function GET(request: NextRequest, { params }: RouteParams) {
  return handlers.GET(request, (await params).churchId);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return handlers.PUT(request, (await params).churchId);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return handlers.DELETE(request, (await params).churchId);
}
