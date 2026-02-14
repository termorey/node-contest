import { io } from "socket.io-client";
import { receivedUserId } from "@/shared/store/user.ts";
import { receivedContestInfo } from "../store/contest.ts";
import { SOCKET_EVENT } from "./events.ts";

export const socket = io("ws://localhost:4000");
socket.once("connect", () => {
  if (socket.id) receivedUserId(socket.id);
});
socket.on(SOCKET_EVENT.contestSteps, receivedContestInfo);

export { SOCKET_EVENT } from "./events.ts";
