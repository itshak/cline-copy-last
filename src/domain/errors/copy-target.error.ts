import { CopyLastError } from "./copy-last.error.js";

export class UnknownCopyLastArgumentError extends CopyLastError {
  constructor(argument: string) {
    super(`Unknown argument: ${argument}`);
    this.name = "UnknownCopyLastArgumentError";
  }
}

export class DuplicatedCopyTargetError extends CopyLastError {
  constructor(current: string, duplicated: string) {
    super(`Target specified more than once: ${current}, ${duplicated}`);
    this.name = "DuplicatedCopyTargetError";
  }
}

export class PairTargetIsNotMessageRoleError extends CopyLastError {
  constructor() {
    super("Pair target is not a message role");
    this.name = "PairTargetIsNotMessageRoleError";
  }
}
