export class CopyLastCommandArguments {
  private constructor(private readonly values: string[]) { }

  static from(input: string | string[] | undefined): CopyLastCommandArguments {
    if (Array.isArray(input)) {
      return new CopyLastCommandArguments(input.map((item) => item.trim()).filter(Boolean));
    }
    return new CopyLastCommandArguments((input ?? "").trim().split(/\s+/).filter(Boolean));
  }

  get tokens(): readonly string[] {
    return this.values;
  }
}
