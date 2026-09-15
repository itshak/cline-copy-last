import { DuplicatedCopyCountError } from "../errors/copy-count.error.js";
import { DuplicatedCopyTargetError, UnknownCopyLastArgumentError } from "../errors/copy-target.error.js";
import { CopyCount } from "./copy-count.js";
import { CopyLastCommandArguments } from "./copy-last-command-arguments.js";
import { CopyLastCommand } from "./copy-last-command.js";
import { CopyTarget } from "./copy-target.js";

export class CopyLastCommandParser {
  parse(input: string | string[] | undefined): CopyLastCommand {
    const commandArguments = CopyLastCommandArguments.from(input);
    let target: CopyTarget | undefined;
    let count: CopyCount | undefined;

    for (const token of commandArguments.tokens) {
      const maybeTarget = CopyTarget.fromAlias(token);
      if (maybeTarget) {
        if (target) {
          throw new DuplicatedCopyTargetError(target.value, token);
        }
        target = maybeTarget;
        continue;
      }

      if (/^\d+$/.test(token) || token.toLowerCase() === "all") {
        if (count) {
          throw new DuplicatedCopyCountError();
        }
        count = token.toLowerCase() === "all"
          ? CopyCount.all()
          : CopyCount.fromNumber(Number.parseInt(token, 10));
        continue;
      }

      throw new UnknownCopyLastArgumentError(token);
    }

    return new CopyLastCommand({ target, count });
  }
}
