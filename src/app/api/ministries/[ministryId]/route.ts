import { getApplication } from "@/composition/application";

const handler = getApplication().ministries.httpHandlers.resource;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ministryId: string }> },
): Promise<Response> {
  const { ministryId } = await params;
  return handler.get(ministryId);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ministryId: string }> },
): Promise<Response> {
  const { ministryId } = await params;
  return handler.update(ministryId, request);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ ministryId: string }> },
): Promise<Response> {
  const { ministryId } = await params;
  return handler.delete(ministryId);
}
