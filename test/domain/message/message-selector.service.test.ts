import { describe, expect, it } from "vitest";
import { CopyCount } from "../../../src/domain/command/copy-count.js";
import { CopyLastCommand } from "../../../src/domain/command/copy-last-command.js";
import { CopyTarget } from "../../../src/domain/command/copy-target.js";
import { NoAnsweredPairsFoundError, NoMessagesFoundError } from "../../../src/domain/errors/session-message.error.js";
import { MessagePair } from "../../../src/domain/message/message-pair.value-object.js";
import { MessageSelector } from "../../../src/domain/message/message-selector.service.js";
import { SessionMessage } from "../../../src/domain/message/session-message.js";

const selector = new MessageSelector();
const messages = [
  SessionMessage.user("question 1", { id: "u1" }),
  SessionMessage.agent("answer 1", { id: "a1" }),
  SessionMessage.user("question 2", { id: "u2" }),
  SessionMessage.agent("answer 2", { id: "a2" }),
  SessionMessage.user("question 3", { id: "u3" }),
];

describe("MessageSelector", () => {
  it("selects recent role messages in chronological order", () => {
    const selected = selector.select(messages, command("agent", 2));

    expect(selected).toHaveLength(2);
    expect(selected[0]).toBe(messages[1]);
    expect(selected[1]).toBe(messages[3]);
  });

  it("selects answered pairs and ignores unanswered users", () => {
    const selected = selector.select(messages, command("pair", 1));

    expect(selected).toHaveLength(1);
    expect(selected[0]).toBeInstanceOf(MessagePair);
    expect((selected[0] as MessagePair).user).toBe(messages[2]);
    expect((selected[0] as MessagePair).agent).toBe(messages[3]);
  });

  it("selects all matching role messages", () => {
    const selected = selector.select(messages, allCommand("user"));

    expect(selected).toHaveLength(3);
    expect(selected[0]).toBe(messages[0]);
    expect(selected[1]).toBe(messages[2]);
    expect(selected[2]).toBe(messages[4]);
  });

  it("selects all answered pairs", () => {
    const selected = selector.select(messages, allCommand("pair"));

    expect(selected).toHaveLength(2);
    expect((selected[0] as MessagePair).user).toBe(messages[0]);
    expect((selected[0] as MessagePair).agent).toBe(messages[1]);
    expect((selected[1] as MessagePair).user).toBe(messages[2]);
    expect((selected[1] as MessagePair).agent).toBe(messages[3]);
  });

  it("throws when no messages match", () => {
    expect(() => selector.select([], command("agent", 1))).toThrow(NoMessagesFoundError);
    expect(() => selector.select([SessionMessage.user("unanswered")], command("pair", 1))).toThrow(NoAnsweredPairsFoundError);
  });
});

function command(target: "agent" | "user" | "pair", count: number): CopyLastCommand {
  return new CopyLastCommand({ target: CopyTarget.fromValue(target), count: CopyCount.fromNumber(count) });
}

function allCommand(target: "agent" | "user" | "pair"): CopyLastCommand {
  return new CopyLastCommand({ target: CopyTarget.fromValue(target), count: CopyCount.all() });
}
