import { describe, expect, it } from "vitest";
import { MessageId } from "../../../src/domain/message/message-id.value-object.js";

describe("MessageId", () => {
  it("creates message IDs from non-empty strings", () => {
    expect(MessageId.fromString(" cmd ")?.value).toBe("cmd");
    expect(MessageId.fromString("")).toBeUndefined();
    expect(MessageId.fromString(undefined)).toBeUndefined();
  });

  it("compares message IDs by value", () => {
    const messageID = MessageId.fromString("cmd");

    expect(messageID?.equals("cmd")).toBe(true);
    expect(messageID?.equals(MessageId.fromString("cmd"))).toBe(true);
    expect(messageID?.equals("other")).toBe(false);
    expect(messageID?.equals(undefined)).toBe(false);
  });
});
