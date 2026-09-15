import type { CopyLastCommand } from "../../domain/command/copy-last-command.js";
import type { Notifier } from "../../domain/ports/notifier.port.js";

/**
 * Formats the user-facing confirmation for a successful `/copy-last` run.
 *
 * Message wording is identical to the upstream OpenCode notifier
 * (`Copied <count|all> <target> message(s) to clipboard`) so behaviour stays
 * in parity. Cline surfaces the slash-command handler's return value in the
 * chat surface, so the notifier collects messages here and `index.ts` returns
 * them — hosts that additionally expose a toast client can be wired through
 * {@link ToastClient} in the future without changing the use-case.
 */
export interface ToastClient {
  tui?: {
    showToast?(input: { body: { title?: string; message: string; variant: "info" | "success" | "warning" | "error"; duration?: number } }): Promise<unknown>
  }
}

export class ClineNotifier implements Notifier {
  private lastMessage = "";
  private lastVariant: "success" | "error" = "success";

  constructor(private readonly client?: ToastClient) { }

  async success(command: CopyLastCommand): Promise<void> {
    const noun = "message";
    const plural = command.countValue === 1 ? noun : `${noun}s`;
    const count = command.isAllCount() ? "all" : command.countValue;
    await this.showToast(`Copied ${count} ${command.targetValue} ${plural} to clipboard`, "success");
  }

  async error(message: string): Promise<void> {
    await this.showToast(message, "error");
  }

  getLastMessage(): string {
    return this.lastMessage;
  }

  private async showToast(message: string, variant: "success" | "error"): Promise<void> {
    this.lastMessage = message;
    this.lastVariant = variant;
    await this.client?.tui?.showToast?.({ body: { message, variant } });
  }
}
