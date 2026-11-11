import { describe, expect, it } from "vitest";

import {
  isDocumentContent,
  isUuid,
  normalizeTitle,
} from "../lib/server-validation";

describe("server validation", () => {
  it("accepts UUIDs and rejects malformed ids", () => {
    expect(isUuid("6813471a-33b6-40ff-8ba6-f246f504edb4")).toBe(true);
    expect(isUuid("not-a-user")).toBe(false);
  });

  it("normalizes empty and oversized titles", () => {
    expect(normalizeTitle("  ")).toBe("Untitled document");
    expect(normalizeTitle("a".repeat(200))).toHaveLength(120);
  });

  it("accepts TipTap documents and rejects arbitrary objects", () => {
    expect(
      isDocumentContent({
        type: "doc",
        content: [{ type: "paragraph" }],
      })
    ).toBe(true);
    expect(isDocumentContent({ html: "<script>bad</script>" })).toBe(false);
  });
});
