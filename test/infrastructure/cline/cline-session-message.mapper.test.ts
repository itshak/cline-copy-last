import { describe, expect, it } from "vitest";
import { MessageId } from "../../../src/domain/message/message-id.value-object.js";
import { ClineSessionMessageMapper } from "../../../src/infrastructure/cline/cline-session-message.mapper.js";
import { ClineValueReader } from "../../../src/infrastructure/cline/cline-value-reader.js";

const mapper = new ClineSessionMessageMapper(new ClineValueReader());

describe("ClineSessionMessageMapper", () => {
  it("normalizes Cline session entries", () => {
    const userMessages = mapper.toSessionMessages({
      id: "u1",
      role: "user",
      content: [{ type: "text", text: "hello" }],
      ts: 1786297442927,
    });
    const agentMessages = mapper.toSessionMessages({
      id: "a1",
      role: "assistant",
      content: [{ type: "text", text: "hi" }],
      ts: 1786297447594,
    });

    expect(userMessages).toHaveLength(1);
    expect(userMessages[0].id).toBe("u1");
    expect(userMessages[0].role).toBe("user");
    expect(userMessages[0].content).toBe("hello");
    expect(agentMessages).toHaveLength(1);
    expect(agentMessages[0].id).toBe("a1");
    expect(agentMessages[0].role).toBe("agent");
    expect(agentMessages[0].content).toBe("hi");
  });

  it("skips thinking and tool blocks", () => {
    const messages = mapper.toSessionMessages({
      id: "a2",
      role: "assistant",
      content: [
        { type: "thinking", thinking: "internal reasoning" },
        { type: "tool_use", id: "call_1", name: "read_files", input: {} },
        { type: "text", text: "visible answer" },
      ],
      ts: 1,
    });
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("visible answer");
  });

  it("drops entries without text content", () => {
    expect(mapper.toSessionMessages({
      id: "a3", role: "assistant", content: [{ type: "thinking", thinking: "only" }], ts: 1,
    })).toEqual([]);
    expect(mapper.toSessionMessages({
      id: "empty", role: "assistant", content: [], ts: 1,
    })).toEqual([]);
  });

  it("normalizes OpenCode message entries", () => {
    const userMessages = mapper.toSessionMessages({
      info: { id: "u1", role: "user", time: { created: "2026-06-07T10:00:00.000Z" } },
      parts: [{ type: "text", text: "hello" }, { type: "file", text: "ignored" }],
    });
    const agentMessages = mapper.toSessionMessages({
      info: { id: "a1", role: "assistant", createdAt: "2026-06-07T10:01:00.000Z" },
      parts: [{ type: "text", text: "hi" }],
    });

    expect(userMessages).toHaveLength(1);
    expect(userMessages[0].id).toBe("u1");
    expect(userMessages[0].role).toBe("user");
    expect(userMessages[0].content).toBe("hello");
    expect(userMessages[0].createdAt).toBe("2026-06-07T10:00:00.000Z");
    expect(agentMessages).toHaveLength(1);
    expect(agentMessages[0].id).toBe("a1");
    expect(agentMessages[0].role).toBe("agent");
    expect(agentMessages[0].content).toBe("hi");
    expect(agentMessages[0].createdAt).toBe("2026-06-07T10:01:00.000Z");
  });

  it("excludes the command message", () => {
    expect(mapper.toSessionMessages({ info: { id: "cmd", role: "user" }, parts: ["/copy-last user"] }, MessageId.fromString("cmd"))).toEqual([]);
    expect(mapper.toSessionMessages({ id: "cmd", role: "user", content: [{ type: "text", text: "/copy-last" }] }, MessageId.fromString("cmd"))).toEqual([]);
  });

  it("returns an empty list for unsupported entries", () => {
    expect(mapper.toSessionMessages(undefined)).toEqual([]);
    expect(mapper.toSessionMessages({ info: { id: "tool", role: "tool" }, parts: [{ type: "text", text: "skip" }] })).toEqual([]);
    expect(mapper.toSessionMessages({ id: "x", role: "tool", content: [{ type: "text", text: "skip" }] })).toEqual([]);
  });

  it("reads direct and info content fallbacks", () => {
    expect(mapper.toSessionMessages({ id: "direct", role: "user", text: "direct text" })[0].content).toBe("direct text");
    expect(mapper.toSessionMessages({ info: { id: "info", role: "assistant", content: "info text" } })[0].content).toBe("info text");
  });
});
