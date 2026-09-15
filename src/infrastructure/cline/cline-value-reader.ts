export class ClineValueReader {
  isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  string(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  stringArray(value: unknown): string[] | undefined {
    return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : undefined;
  }
}
