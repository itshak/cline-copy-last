import { CopyCount, type CopyCountValue } from "./copy-count.js";
import type { CopyTargetValue } from "./copy-target.js";
import { CopyTarget } from "./copy-target.js";

export class CopyLastCommand {
  readonly target: CopyTarget;
  readonly count: CopyCount;

  constructor(input: { target?: CopyTarget; count?: CopyCount } = {}) {
    this.target = input.target ?? CopyTarget.default();
    this.count = input.count ?? CopyCount.default();
  }

  static default(): CopyLastCommand {
    return new CopyLastCommand();
  }

  get targetValue(): CopyTargetValue {
    return this.target.value;
  }

  get countValue(): CopyCountValue {
    return this.count.value;
  }

  get countNumber(): number {
    return this.count.numericValue;
  }

  isAllCount(): boolean {
    return this.count.isAll();
  }
}
