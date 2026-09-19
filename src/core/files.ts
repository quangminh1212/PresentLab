import { createHash } from "node:crypto";
import { mkdir, readFile, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

import { PresentLabError } from "./errors.js";

export const DEFAULT_MAX_INPUT_BYTES = 10 * 1024 * 1024;

export function getWorkspaceRoot(requestedRoot?: string): string {
  return resolve(requestedRoot ?? process.env.PRESENTLAB_ROOT ?? process.cwd());
}

export function isPathInside(root: string, candidate: string, allowRoot = false): boolean {
  const relativeCandidate = relative(resolve(root), resolve(candidate));
  if (!allowRoot && relativeCandidate.length === 0) return false;
  return !(
    relativeCandidate === ".." ||
    relativeCandidate.startsWith(`..${sep}`) ||
    isAbsolute(relativeCandidate)
  );
}

export function resolveWorkspacePath(root: string, candidate: string, label: string): string {
  if (!candidate.trim()) {
    throw new PresentLabError("INVALID_PATH", `${label} must not be empty.`);
  }

  const absoluteRoot = resolve(root);
  const absoluteCandidate = resolve(absoluteRoot, candidate);
  const escapesRoot = !isPathInside(absoluteRoot, absoluteCandidate);

  if (escapesRoot) {
    throw new PresentLabError(
      "PATH_OUTSIDE_WORKSPACE",
      `${label} must resolve to a non-root path inside the configured workspace.`,
    );
  }

  return absoluteCandidate;
}

export async function readUtf8File(
  filePath: string,
  maxBytes = DEFAULT_MAX_INPUT_BYTES,
): Promise<string> {
  const fileStats = await stat(filePath).catch(() => undefined);
  if (!fileStats?.isFile()) {
    throw new PresentLabError("INPUT_NOT_FOUND", `Input file does not exist: ${filePath}`);
  }
  if (fileStats.size > maxBytes) {
    throw new PresentLabError(
      "INPUT_TOO_LARGE",
      `Input file is ${fileStats.size} bytes; the limit is ${maxBytes} bytes.`,
    );
  }
  return readFile(filePath, "utf8");
}

export async function ensureDirectory(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true });
}

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function relativeArtifactPath(root: string, filePath: string): string {
  return relative(resolve(root), resolve(filePath)).split(sep).join("/");
}
