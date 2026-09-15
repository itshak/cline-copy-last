import type { CopyLastCommand } from "../../domain/command/copy-last-command.js";

export class CopyLastResponse {
  constructor(
    readonly command: CopyLastCommand,
    readonly copiedText: string,
  ) { }
}
