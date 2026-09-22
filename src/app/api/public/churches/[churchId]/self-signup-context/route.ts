import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

interface RouteParams {
  params: Promise<{ churchId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { churchId } = await params;
  return getApplication().selfSignup.httpHandlers.context(request, churchId);
}
