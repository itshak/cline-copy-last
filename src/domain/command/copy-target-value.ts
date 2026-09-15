import { MESSAGE_ROLE } from "../message/session-message-role.js";

export const COPY_TARGET = {
  AGENT: MESSAGE_ROLE.AGENT,
  USER: MESSAGE_ROLE.USER,
  PAIR: "pair",
} as const;

export type CopyTargetValue = typeof COPY_TARGET[keyof typeof COPY_TARGET];
export type MessageCopyTargetValue = typeof COPY_TARGET.AGENT | typeof COPY_TARGET.USER;
