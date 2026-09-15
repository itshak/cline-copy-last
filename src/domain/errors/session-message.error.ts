import { CopyLastError } from "./copy-last.error.js";
import type { SessionMessageRole } from "../message/session-message-role.js";

export class NoMessagesFoundError extends CopyLastError {
  constructor(role: SessionMessageRole) {
    super(`No ${role} messages found`);
    this.name = "NoMessagesFoundError";
  }
}

export class NoAnsweredPairsFoundError extends CopyLastError {
  constructor() {
    super("No answered user-agent pairs found");
    this.name = "NoAnsweredPairsFoundError";
  }
}

export class EmptySessionMessageContentError extends CopyLastError {
  constructor() {
    super("Session message content cannot be empty");
    this.name = "EmptySessionMessageContentError";
  }
}
