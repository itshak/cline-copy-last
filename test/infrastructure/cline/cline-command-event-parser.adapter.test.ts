import { describe, expect, it, vi } from "vitest";
import { MessageId } from "../../../src/domain/message/message-id.value-object.js";
import type { ClineCommandEventMapperContract } from "../../../src/infrastructure/cline/cline-command-event.mapper.js";
import { ClineCommandEventParser } from "../../../src/infrastructure/cline/cline-command-event-parser.adapter.js";

describe("ClineCommandEventParser", () => {
  it("maps command events", () => {
    const input = "user 2";
    const commandEvent = {
      sessionID: "session-1",
      arguments: "user 2",
      messageID: MessageId.fromString("cmd"),
    };
    const mapper: ClineCommandEventMapperContract = {
      toCopyLastCommandEvent: vi.fn(() => commandEvent),
    };

    expect(new ClineCommandEventParser(mapper).parse(input)).toEqual(commandEvent);
    expect(mapper.toCopyLastCommandEvent).toHaveBeenCalledWith(input);
  });
});
