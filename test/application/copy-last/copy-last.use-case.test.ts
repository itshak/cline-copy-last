import { describe, expect, it } from "vitest";
import { CopyLastRequest } from "../../../src/application/copy-last/copy-last.request.js";
import { CopyLastUseCase } from "../../../src/application/copy-last/copy-last.use-case.js";
import { CopyLastCommandParser } from "../../../src/domain/command/copy-last-command-parser.service.js";
import { MessageId } from "../../../src/domain/message/message-id.value-object.js";
import { MarkdownMessageFormatter } from "../../../src/domain/message/markdown-message-formatter.service.js";
import { MessageSelector } from "../../../src/domain/message/message-selector.service.js";
import { SessionMessage } from "../../../src/domain/message/session-message.js";
import type { ClipboardWriter } from "../../../src/domain/ports/clipboard-writer.port.js";
import type { SessionReader } from "../../../src/domain/ports/session-reader.port.js";

describe("CopyLastUseCase", () => {
  it("orchestrates parsing, selection, formatting and clipboard writing", async () => {
    const messages = [
      SessionMessage.user("question", { id: "u1" }),
      SessionMessage.agent("answer", { id: "a1" }),
    ];
    const writes: string[] = [];
    const sessionReader: SessionReader = {
      read: async (sessionID, excludeMessageID) => {
        expect(sessionID).toBe("session-1");
        expect(excludeMessageID?.equals("cmd")).toBe(true);
        return messages;
      },
    };
    const clipboardWriter: ClipboardWriter = {
      write: async (text) => {
        writes.push(text);
      },
    };

    const result = await new CopyLastUseCase(
      sessionReader,
      clipboardWriter,
      new CopyLastCommandParser(),
      new MessageSelector(),
      new MarkdownMessageFormatter(),
    ).execute(new CopyLastRequest("pair", "session-1", MessageId.fromString("cmd")));

    expect(result.command.targetValue).toBe("pair");
    expect(result.command.countValue).toBe(1);
    expect(result.copiedText).toBe("## User\n\nquestion\n\n## Agent\n\nanswer");
    expect(writes).toEqual(["## User\n\nquestion\n\n## Agent\n\nanswer"]);
  });
});
