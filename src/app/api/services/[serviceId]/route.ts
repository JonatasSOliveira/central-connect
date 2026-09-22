import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

const handlers = getApplication().services.httpHandlers.service;
interface RouteParams {
  params: Promise<{ serviceId: string }>;
}
export async function GET(request: NextRequest, { params }: RouteParams) {
  return handlers.GET(request, (await params).serviceId);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return handlers.PUT(request, (await params).serviceId);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return handlers.DELETE(request, (await params).serviceId);
}
