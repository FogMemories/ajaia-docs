import { NextRequest } from "next/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MAX_TITLE_LENGTH = 120;
export const MAX_CONTENT_BYTES = 200_000;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function getUserId(request: NextRequest) {
  const userId = request.headers.get("x-user-id")?.trim();
  return isUuid(userId) ? userId : null;
}

export function normalizeTitle(value: unknown) {
  if (typeof value !== "string") {
    return "Untitled document";
  }

  const title = value.trim();
  return (title || "Untitled document").slice(0, MAX_TITLE_LENGTH);
}

export function isDocumentContent(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const content = value as { type?: unknown; content?: unknown };
  if (content.type !== "doc" || !Array.isArray(content.content)) {
    return false;
  }

  return Buffer.byteLength(JSON.stringify(value), "utf8") <= MAX_CONTENT_BYTES;
}

export async function readJson(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
