import { describe, expect, it } from "vitest";
import { CopyTarget } from "../../../src/domain/command/copy-target.js";

describe("CopyTarget", () => {
  it("normalizes target aliases", () => {
    expect(CopyTarget.fromAlias("agent")?.value).toBe("agent");
    expect(CopyTarget.fromAlias("assistant")?.value).toBe("agent");
    expect(CopyTarget.fromAlias("user")?.value).toBe("user");
    expect(CopyTarget.fromAlias("me")?.value).toBe("user");
    expect(CopyTarget.fromAlias("pair")?.value).toBe("pair");
    expect(CopyTarget.fromAlias("us")?.value).toBe("pair");
  });

  it("converts message targets to roles", () => {
    expect(CopyTarget.fromAlias("assistant")?.toMessageRole()).toBe("agent");
    expect(CopyTarget.fromAlias("user")?.toMessageRole()).toBe("user");
    expect(CopyTarget.fromAlias("pair")?.toMessageRole()).toBeUndefined();
  });

  it("detects target kinds", () => {
    expect(CopyTarget.fromAlias("assistant")?.isAgent()).toBe(true);
    expect(CopyTarget.fromAlias("me")?.isUser()).toBe(true);
    expect(CopyTarget.fromAlias("us")?.isPair()).toBe(true);
  });
});
