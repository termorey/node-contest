import { io } from "socket.io-client";
import { receivedUserId } from "shared/store/user/user.ts";
import { receivedContestInfo } from "../store/contest/contest.ts";
import { SocketEvent } from "./events.ts";

export const socket = io("ws://localhost:4000");
socket.once("connect", () => {
  receivedUserId(socket.id);
});
socket.on(SocketEvent.contestSteps, receivedContestInfo);

export { SocketEvent } from "./events.ts";
