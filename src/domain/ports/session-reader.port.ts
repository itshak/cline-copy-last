import type { MessageId } from "../message/message-id.value-object.js";
import type { SessionMessage } from "../message/session-message.js";

export interface SessionReader {
  read(sessionID: string, excludeMessageID?: MessageId): Promise<SessionMessage[]>
}
