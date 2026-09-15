import { PairTargetIsNotMessageRoleError } from "../errors/copy-target.error.js";
import { COPY_TARGET, type CopyTargetValue, type MessageCopyTargetValue } from "./copy-target-value.js";

export type { CopyTargetValue } from "./copy-target-value.js";

const TARGET_ALIASES: Record<string, CopyTargetValue> = {
  agent: COPY_TARGET.AGENT,
  assistant: COPY_TARGET.AGENT,
  user: COPY_TARGET.USER,
  me: COPY_TARGET.USER,
  pair: COPY_TARGET.PAIR,
  us: COPY_TARGET.PAIR,
};

export class CopyTarget {
  private constructor(private readonly target: CopyTargetValue) {}

  static default(): CopyTarget {
    return new CopyTarget(COPY_TARGET.AGENT);
  }

  static fromAlias(value: string): CopyTarget | undefined {
    const target = TARGET_ALIASES[value.toLowerCase()];
    return target ? new CopyTarget(target) : undefined;
  }

  static fromValue(value: CopyTargetValue): CopyTarget {
    return new CopyTarget(value);
  }

  get value(): CopyTargetValue {
    return this.target;
  }

  equals(value: CopyTargetValue): boolean {
    return this.target === value;
  }

  isAgent(): boolean {
    return this.target === COPY_TARGET.AGENT;
  }

  isUser(): boolean {
    return this.target === COPY_TARGET.USER;
  }

  isPair(): boolean {
    return this.target === COPY_TARGET.PAIR;
  }

  toMessageRole(): MessageCopyTargetValue | undefined {
    if (this.target === COPY_TARGET.PAIR) {
      return undefined;
    }
    return this.target;
  }

  assertMessageRole(): MessageCopyTargetValue {
    if (this.target === COPY_TARGET.PAIR) {
      throw new PairTargetIsNotMessageRoleError();
    }
    return this.target;
  }
}
