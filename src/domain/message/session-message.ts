import { EmptySessionMessageContentError } from "../errors/session-message.error.js";
import { MESSAGE_ROLE, type SessionMessageRole } from "./session-message-role.js";

export type { SessionMessageRole } from "./session-message-role.js";

export interface SessionMessageProps {
  id?: string
  role: SessionMessageRole
  content: string
  createdAt?: string
}

export class SessionMessage {
  private constructor(private readonly props: SessionMessageProps) {}

  static create(props: SessionMessageProps): SessionMessage {
    if (!props.content.trim()) {
      throw new EmptySessionMessageContentError();
    }
    return new SessionMessage({ ...props, content: props.content.trim() });
  }

  static user(content: string, metadata: Omit<SessionMessageProps, "role" | "content"> = {}): SessionMessage {
    return SessionMessage.create({ ...metadata, role: MESSAGE_ROLE.USER, content });
  }

  static agent(content: string, metadata: Omit<SessionMessageProps, "role" | "content"> = {}): SessionMessage {
    return SessionMessage.create({ ...metadata, role: MESSAGE_ROLE.AGENT, content });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get role(): SessionMessageRole {
    return this.props.role;
  }

  get content(): string {
    return this.props.content;
  }

  get createdAt(): string | undefined {
    return this.props.createdAt;
  }

  isUser(): boolean {
    return this.props.role === MESSAGE_ROLE.USER;
  }

  isAgent(): boolean {
    return this.props.role === MESSAGE_ROLE.AGENT;
  }

  isRole(role: SessionMessageRole): boolean {
    return this.props.role === role;
  }
}
