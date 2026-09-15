import { describe, expect, it } from "vitest";
import { CopyLastCommand } from "../../../src/domain/command/copy-last-command.js";
import { CopyCount } from "../../../src/domain/command/copy-count.js";
import { CopyTarget } from "../../../src/domain/command/copy-target.js";
import { ClineNotifier } from "../../../src/infrastructure/cline/cline-notifier.adapter.js";

describe("ClineNotifier", () => {
  it("formats success messages like the upstream notifier", async () => {
    const notifier = new ClineNotifier();
    await notifier.success(new CopyLastCommand({ target: CopyTarget.fromValue("agent"), count: CopyCount.fromNumber(1) }));
    expect(notifier.getLastMessage()).toBe("Copied 1 agent message to clipboard");
    await notifier.success(new CopyLastCommand({ target: CopyTarget.fromValue("user"), count: CopyCount.fromNumber(2) }));
    expect(notifier.getLastMessage()).toBe("Copied 2 user messages to clipboard");
    await notifier.success(new CopyLastCommand({ target: CopyTarget.fromValue("pair"), count: CopyCount.all() }));
    expect(notifier.getLastMessage()).toBe("Copied all pair messages to clipboard");
  });

  it("records error messages", async () => {
    const notifier = new ClineNotifier();
    await notifier.error("No agent messages found");
    expect(notifier.getLastMessage()).toBe("No agent messages found");
  });
});
