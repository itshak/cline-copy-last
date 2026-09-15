import type { SessionMessage } from "./session-message.js";

export class MessagePair {
  constructor(
    readonly user: SessionMessage,
    readonly agent: SessionMessage,
  ) { }
}
