import type { NextRequest } from "next/server";
import { getApplication } from "@/composition/application";

export async function POST(request: NextRequest) {
  return getApplication().scales.httpHandlers.generation.generate(request);
}
