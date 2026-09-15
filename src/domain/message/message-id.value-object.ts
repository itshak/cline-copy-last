export class MessageId {
  private constructor(readonly value: string) {}

  static fromString(value: string | undefined): MessageId | undefined {
    const trimmed = value?.trim();
    return trimmed ? new MessageId(trimmed) : undefined;
  }

  equals(value: MessageId | string | undefined): boolean {
    return typeof value === "string"
      ? this.value === value
      : this.value === value?.value;
  }
}
