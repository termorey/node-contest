export const SOCKET_EVENT = {
  contestCreated: "contest:created",
  contestUpdated: "contest:updated",
  contestSteps: "contest:steps",
} as const;

export type SocketEvent = (typeof SOCKET_EVENT)[keyof typeof SOCKET_EVENT];
