import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scaleId: string }> },
) {
  const { scaleId } = await params;
  return getApplication().scales.httpHandlers.item(request, scaleId);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ scaleId: string }> },
) {
  const { scaleId } = await params;
  return getApplication().scales.httpHandlers.item(request, scaleId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ scaleId: string }> },
) {
  const { scaleId } = await params;
  return getApplication().scales.httpHandlers.item(request, scaleId);
}
