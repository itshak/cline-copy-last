import type { MessageId } from "../../domain/message/message-id.value-object.js";

export class CopyLastRequest {
  constructor(
    readonly args: string | string[] | undefined,
    readonly sessionID: string,
    readonly excludeMessageID?: MessageId,
  ) {}
}
