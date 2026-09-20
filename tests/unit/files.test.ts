import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PresentLabError } from "../../src/core/errors.js";
import { isPathInside, readUtf8File, resolveWorkspacePath, sha256 } from "../../src/core/files.js";

describe("workspace boundaries", () => {
  it("rejects traversal and the workspace root", () => {
    expect(() => resolveWorkspacePath("C:\\workspace", "..\\secret", "input")).toThrow(
      PresentLabError,
    );
    expect(() => resolveWorkspacePath("C:\\workspace", ".", "output")).toThrow(PresentLabError);
  });

  it("accepts an in-root path and hashes stable content", async () => {
    const root = await mkdtemp(join(tmpdir(), "presentlab-files-"));
    const filePath = join(root, "deck.html");
    await writeFile(filePath, "<html></html>", "utf8");

    expect(resolveWorkspacePath(root, "deck.html", "input")).toBe(filePath);
    expect(isPathInside(root, filePath)).toBe(true);
    expect(isPathInside(root, join(root, "..", "outside.txt"))).toBe(false);
    expect(await readUtf8File(filePath)).toBe("<html></html>");
    expect(sha256("same")).toBe(sha256("same"));
  });
});
