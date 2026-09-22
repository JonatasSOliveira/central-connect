import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

interface RouteParams {
  params: Promise<{ scaleId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { scaleId } = await params;
  return getApplication().scales.httpHandlers.attendance.publish(
    request,
    scaleId,
  );
}
