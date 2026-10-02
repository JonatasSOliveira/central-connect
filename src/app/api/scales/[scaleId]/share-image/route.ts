import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ scaleId: string }> },
) {
  const { scaleId } = await params;
  return getApplication().scales.httpHandlers.shareImage(request, scaleId);
}
