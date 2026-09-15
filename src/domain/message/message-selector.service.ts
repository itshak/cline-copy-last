import { CopyLastCommand } from "../command/copy-last-command.js";
import { COPY_TARGET } from "../command/copy-target-value.js";
import { NoAnsweredPairsFoundError, NoMessagesFoundError } from "../errors/session-message.error.js";
import { MessagePair } from "./message-pair.value-object.js";
import type { SessionMessage } from "./session-message.js";

export type MessageSelection = SessionMessage[] | MessagePair[]

export class MessageSelector {
  select(messages: SessionMessage[], command: CopyLastCommand): MessageSelection {
    if (command.target.equals(COPY_TARGET.PAIR)) {
      return this.selectPairs(messages, command.countNumber);
    }

    const role = command.target.assertMessageRole();
    const matchingMessages = messages.filter((message) => message.isRole(role));
    const selected = command.isAllCount() ? matchingMessages : matchingMessages.slice(-command.countNumber);
    if (selected.length === 0) {
      throw new NoMessagesFoundError(role);
    }
    return selected;
  }

  private selectPairs(messages: SessionMessage[], count: number): MessagePair[] {
    const pairs: MessagePair[] = [];
    let pendingUser: SessionMessage | undefined;

    for (const message of messages) {
      if (message.isUser()) {
        pendingUser = message;
        continue;
      }

      if (message.isAgent() && pendingUser) {
        pairs.push(new MessagePair(pendingUser, message));
        pendingUser = undefined;
      }
    }

    const selected = count === Number.POSITIVE_INFINITY ? pairs : pairs.slice(-count);
    if (selected.length === 0) {
      throw new NoAnsweredPairsFoundError();
    }
    return selected;
  }
}
