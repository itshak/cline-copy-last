export class CopyLastError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CopyLastError";
  }
}

export function isCopyLastError(error: unknown): error is CopyLastError {
  return error instanceof CopyLastError;
}
