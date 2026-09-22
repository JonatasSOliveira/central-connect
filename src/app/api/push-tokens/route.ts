import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

export async function POST(request: NextRequest) {
  return getApplication().notifications.httpHandlers.pushTokens.register(
    request,
  );
}

export async function DELETE(request: NextRequest) {
  return getApplication().notifications.httpHandlers.pushTokens.deactivate(
    request,
  );
}
