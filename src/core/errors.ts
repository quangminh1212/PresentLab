export class PresentLabError extends Error {
  public readonly code: string;

  public constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PresentLabError";
    this.code = code;
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
