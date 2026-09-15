import { CopyCountTooLargeError, CopyCountTooSmallError, InvalidCopyCountError } from "../errors/copy-count.error.js";

const DEFAULT_COUNT = 1;
const MAX_COUNT = 20;
const MIN_COUNT = 1;
const ALL_COUNT = "all";

export type CopyCountValue = number | typeof ALL_COUNT;

export class CopyCount {
  private constructor(private readonly count: CopyCountValue) { }

  static default(): CopyCount {
    return new CopyCount(DEFAULT_COUNT);
  }

  static fromNumber(value: number): CopyCount {
    if (!Number.isInteger(value)) {
      throw new InvalidCopyCountError(value);
    }
    if (value < MIN_COUNT) {
      throw new CopyCountTooSmallError();
    }
    if (value > MAX_COUNT) {
      throw new CopyCountTooLargeError(MAX_COUNT);
    }
    return new CopyCount(value);
  }

  static all(): CopyCount {
    return new CopyCount(ALL_COUNT);
  }

  get value(): CopyCountValue {
    return this.count;
  }

  get numericValue(): number {
    if (this.count === ALL_COUNT) {
      return Number.POSITIVE_INFINITY;
    }
    return this.count;
  }

  isAll(): boolean {
    return this.count === ALL_COUNT;
  }
}
