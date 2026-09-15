import type { MessageId } from "../../domain/message/message-id.value-object.js";
import type { ClineCommandEventMapperContract } from "./cline-command-event.mapper.js";

export interface CopyLastCommandEvent {
  sessionID: string
  arguments?: string | string[]
  messageID?: MessageId
}

export class ClineCommandEventParser {
  constructor(private readonly mapper: ClineCommandEventMapperContract) { }

  parse(input: unknown): CopyLastCommandEvent | undefined {
    return this.mapper.toCopyLastCommandEvent(input);
  }
}
