import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { MessageId } from "../../../src/domain/message/message-id.value-object.js";
import { SessionMessage } from "../../../src/domain/message/session-message.js";
import { ClineSessionReader } from "../../../src/infrastructure/cline/cline-session-reader.adapter.js";
import type { ClineSessionMessageMapperContract } from "../../../src/infrastructure/cline/cline-session-message.mapper.js";

describe("ClineSessionReader", () => {
  it("reads Cline session files and maps entries", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "cline-copy-last-"));
    const sessionDir = path.join(dir, "session-1");
    mkdirSync(sessionDir, { recursive: true });
    writeFileSync(
      path.join(sessionDir, "session-1.messages.json"),
      JSON.stringify({ messages: [{ id: "u1" }, { id: "a1" }] }),
    );
    const firstMessage = SessionMessage.user("hello", { id: "u1" });
    const secondMessage = SessionMessage.agent("hi", { id: "a1" });
    const entries = [{ id: "u1" }, { id: "a1" }];
    const mapper: ClineSessionMessageMapperContract = {
      toSessionMessages: vi.fn((entry) => (entry as { id: string }).id === "u1" ? [firstMessage] : [secondMessage]),
    };

    const commandMessageID = MessageId.fromString("cmd");
    const messages = await new ClineSessionReader(mapper, { sessionsDir: dir }).read("session-1", commandMessageID);

    expect(mapper.toSessionMessages).toHaveBeenNthCalledWith(1, entries[0], commandMessageID);
    expect(mapper.toSessionMessages).toHaveBeenNthCalledWith(2, entries[1], commandMessageID);
    expect(messages).toEqual([firstMessage, secondMessage]);
  });

  it("falls back to the most recent session file", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "cline-copy-last-"));
    for (const id of ["old-session", "new-session"]) {
      const sessionDir = path.join(dir, id);
      mkdirSync(sessionDir, { recursive: true });
      writeFileSync(path.join(sessionDir, `${id}.messages.json`), JSON.stringify({ messages: [{ id }] }));
    }
    const mapper: ClineSessionMessageMapperContract = {
      toSessionMessages: vi.fn((entry: unknown) => [SessionMessage.user((entry as { id: string }).id)]),
    };
    const reader = new ClineSessionReader(mapper, { sessionsDir: dir });
    const messages = await reader.read("missing-session");
    expect(messages).toHaveLength(1);
  });

  it("returns an empty list when no session file exists", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "cline-copy-last-"));
    const mapper: ClineSessionMessageMapperContract = {
      toSessionMessages: vi.fn(),
    };

    await expect(new ClineSessionReader(mapper, { sessionsDir: dir }).read("session-1")).resolves.toEqual([]);
    expect(mapper.toSessionMessages).not.toHaveBeenCalled();
  });
});
