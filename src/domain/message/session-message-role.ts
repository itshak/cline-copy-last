export const MESSAGE_ROLE = {
  AGENT: "agent",
  USER: "user",
} as const;

export type SessionMessageRole = typeof MESSAGE_ROLE[keyof typeof MESSAGE_ROLE];
