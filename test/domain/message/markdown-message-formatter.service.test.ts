import { describe, expect, it } from "vitest";
import { MarkdownMessageFormatter } from "../../../src/domain/message/markdown-message-formatter.service.js";
import { MessagePair } from "../../../src/domain/message/message-pair.value-object.js";
import { SessionMessage } from "../../../src/domain/message/session-message.js";

const formatter = new MarkdownMessageFormatter();

describe("MarkdownMessageFormatter", () => {
  it("formats role messages separated by markdown rules", () => {
    expect(formatter.format([
      SessionMessage.agent(" first "),
      SessionMessage.agent("second"),
    ])).toBe("first\n\n---\n\nsecond");
  });

  it("formats pairs with headings", () => {
    expect(formatter.format([
      new MessagePair(
        SessionMessage.user("question"),
        SessionMessage.agent("answer"),
      ),
    ])).toBe("## User\n\nquestion\n\n## Agent\n\nanswer");
  });
});
