import { MessagePair } from "./message-pair.value-object.js";
import type { MessageSelection } from "./message-selector.service.js";
import type { SessionMessage } from "./session-message.js";

const MESSAGE_SEPARATOR = '\n\n---\n\n';

export class MarkdownMessageFormatter {
  format(items: MessageSelection): string {
    if (items.length === 0) {
      return "";
    }
    if (items[0] instanceof MessagePair) {
      return (items as MessagePair[]).map((pair) => this.formatPair(pair)).join(MESSAGE_SEPARATOR);
    }
    return (items as SessionMessage[]).map((message) => message.content.trim()).join(MESSAGE_SEPARATOR);
  }

  private formatPair(pair: MessagePair): string {
    return `## User\n\n${pair.user.content.trim()}\n\n## Agent\n\n${pair.agent.content.trim()}`;
  }
}
