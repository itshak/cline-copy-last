import { CopyLastError } from "./copy-last.error.js";

export class InvalidCopyCountError extends CopyLastError {
  constructor(value: number) {
    super(`Count must be an integer: ${value}`);
    this.name = "InvalidCopyCountError";
  }
}

export class CopyCountTooSmallError extends CopyLastError {
  constructor() {
    super("Count must be at least 1");
    this.name = "CopyCountTooSmallError";
  }
}

export class CopyCountTooLargeError extends CopyLastError {
  constructor(max: number) {
    super(`Count must be ${max} or less`);
    this.name = "CopyCountTooLargeError";
  }
}

export class DuplicatedCopyCountError extends CopyLastError {
  constructor() {
    super("Count specified more than once");
    this.name = "DuplicatedCopyCountError";
  }
}
