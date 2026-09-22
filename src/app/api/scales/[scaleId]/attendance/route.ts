import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

interface RouteParams {
  params: Promise<{ scaleId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { scaleId } = await params;
  return getApplication().scales.httpHandlers.attendance.get(request, scaleId);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { scaleId } = await params;
  return getApplication().scales.httpHandlers.attendance.save(request, scaleId);
}
