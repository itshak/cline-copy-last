import { describe, expect, it } from "vitest";
import { ClineCommandEventMapper } from "../../../src/infrastructure/cline/cline-command-event.mapper.js";
import { ClineValueReader } from "../../../src/infrastructure/cline/cline-value-reader.js";

const mapper = new ClineCommandEventMapper(new ClineValueReader());

describe("ClineCommandEventMapper", () => {
  it("parses raw slash-command strings", () => {
    expect(mapper.toCopyLastCommandEvent("user 2")).toEqual({
      sessionID: "",
      arguments: "user 2",
      messageID: undefined,
    });
    expect(mapper.toCopyLastCommandEvent("")).toEqual({
      sessionID: "",
      arguments: "",
      messageID: undefined,
    });
  });

  it("parses arrays of arguments", () => {
    expect(mapper.toCopyLastCommandEvent(["user", "2"])).toEqual({
      sessionID: "",
      arguments: ["user", "2"],
      messageID: undefined,
    });
  });

  it("parses host event objects with aliases", () => {
    expect(mapper.toCopyLastCommandEvent({
      sessionID: "session-1",
      arguments: "user 2",
      messageID: "cmd",
    })).toEqual({
      sessionID: "session-1",
      arguments: "user 2",
      messageID: expect.objectContaining({ value: "cmd" }),
    });
    expect(mapper.toCopyLastCommandEvent({
      sessionId: "session-2",
      args: "pair all",
    })).toEqual({
      sessionID: "session-2",
      arguments: "pair all",
      messageID: undefined,
    });
    expect(mapper.toCopyLastCommandEvent({
      text: "me",
    })).toEqual({
      sessionID: "",
      arguments: "me",
      messageID: undefined,
    });
  });

  it("ignores unsupported events", () => {
    expect(mapper.toCopyLastCommandEvent(undefined)).toBeUndefined();
    expect(mapper.toCopyLastCommandEvent(null)).toBeUndefined();
    expect(mapper.toCopyLastCommandEvent(42)).toBeUndefined();
  });
});
