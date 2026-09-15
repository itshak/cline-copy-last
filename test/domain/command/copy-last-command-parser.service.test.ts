import { describe, expect, it } from "vitest";
import { CopyLastCommandParser } from "../../../src/domain/command/copy-last-command-parser.service.js";
import { CopyCountTooLargeError, DuplicatedCopyCountError } from "../../../src/domain/errors/copy-count.error.js";
import { DuplicatedCopyTargetError, UnknownCopyLastArgumentError } from "../../../src/domain/errors/copy-target.error.js";

const parser = new CopyLastCommandParser();

describe("CopyLastCommandParser", () => {
  it("uses default target and count", () => {
    const command = parser.parse("");

    expect(command.targetValue).toBe("agent");
    expect(command.countValue).toBe(1);
  });

  it("parses target and count in any order", () => {
    const userCommand = parser.parse("user 2");
    const pairCommand = parser.parse("3 pair");

    expect(userCommand.targetValue).toBe("user");
    expect(userCommand.countValue).toBe(2);
    expect(pairCommand.targetValue).toBe("pair");
    expect(pairCommand.countValue).toBe(3);
  });

  it("parses all as the count in any order", () => {
    const userCommand = parser.parse("user all");
    const pairCommand = parser.parse("ALL pair");

    expect(userCommand.targetValue).toBe("user");
    expect(userCommand.countValue).toBe("all");
    expect(pairCommand.targetValue).toBe("pair");
    expect(pairCommand.countValue).toBe("all");
  });

  it("supports MVP aliases", () => {
    const meCommand = parser.parse("me");
    const usCommand = parser.parse("us 2");

    expect(meCommand.targetValue).toBe("user");
    expect(meCommand.countValue).toBe(1);
    expect(usCommand.targetValue).toBe("pair");
    expect(usCommand.countValue).toBe(2);
  });

  it("rejects ambiguous or invalid arguments", () => {
    expect(() => parser.parse("you")).toThrow(UnknownCopyLastArgumentError);
    expect(() => parser.parse("agent user")).toThrow(DuplicatedCopyTargetError);
    expect(() => parser.parse("all 2")).toThrow(DuplicatedCopyCountError);
    expect(() => parser.parse("21")).toThrow(CopyCountTooLargeError);
  });
});
