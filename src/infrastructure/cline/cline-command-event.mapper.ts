import { MessageId } from "../../domain/message/message-id.value-object.js";
import type { CopyLastCommandEvent } from "./cline-command-event-parser.adapter.js";
import type { ClineValueReader } from "./cline-value-reader.js";

/**
 * Normalizes the payload a Cline `registerCommand` handler receives into a
 * {@link CopyLastCommandEvent}.
 *
 * Cline invokes slash-command handlers with the raw trailing input (`string`),
 * so the common case is a plain string like `"user 2"`. Objects are also
 * accepted (`{ sessionID, arguments, messageID }` and common aliases such as
 * `args`, `text`, `prompt`, `sessionId`, `messageId`) so unit tests and
 * future host payloads keep working. A missing session id falls back to an
 * empty string — the session reader then resolves the most recent Cline
 * session file from disk.
 */
export interface ClineCommandEventMapperContract {
  toCopyLastCommandEvent(input: unknown): CopyLastCommandEvent | undefined
}

export class ClineCommandEventMapper implements ClineCommandEventMapperContract {
  constructor(private readonly valueReader: ClineValueReader) { }

  toCopyLastCommandEvent(input: unknown): CopyLastCommandEvent | undefined {
    if (typeof input === "string") {
      return { sessionID: "", arguments: input, messageID: undefined };
    }
    if (Array.isArray(input)) {
      return { sessionID: "", arguments: input, messageID: undefined };
    }
    if (!this.valueReader.isRecord(input)) {
      return undefined;
    }
    const sessionID = this.valueReader.string(input.sessionID)
      ?? this.valueReader.string(input.sessionId)
      ?? this.valueReader.string(input.session_id)
      ?? "";
    const args = this.valueReader.string(input.arguments)
      ?? this.valueReader.string(input.args)
      ?? this.valueReader.string(input.text)
      ?? this.valueReader.string(input.prompt)
      ?? this.valueReader.string(input.input)
      ?? this.stringArrayToString(input.arguments)
      ?? this.stringArrayToString(input.args)
      ?? "";
    const messageID = MessageId.fromString(
      this.valueReader.string(input.messageID)
      ?? this.valueReader.string(input.messageId)
      ?? this.valueReader.string(input.message_id)
      ?? this.valueReader.string(input.id),
    );
    return { sessionID, arguments: args, messageID };
  }

  private stringArrayToString(value: unknown): string | undefined {
    const arr = this.valueReader.stringArray(value);
    return arr ? arr.join(" ") : undefined;
  }
}
