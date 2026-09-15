import type { CopyLastCommand } from "../command/copy-last-command.js";

export interface Notifier {
  success(command: CopyLastCommand): Promise<void>
  error(message: string): Promise<void>
}
