import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

const handlers = getApplication().serviceTemplates.httpHandlers.serviceTemplate;
interface RouteParams {
  params: Promise<{ templateId: string }>;
}
export async function GET(request: NextRequest, { params }: RouteParams) {
  return handlers.GET(request, (await params).templateId);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return handlers.PUT(request, (await params).templateId);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return handlers.DELETE(request, (await params).templateId);
}
