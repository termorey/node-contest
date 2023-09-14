import {io} from "socket.io-client"
import { receivedUserId } from "shared/store/user";
import { receivedContestInfo } from "../store/contest";
import { SocketEvent } from "./events.ts";

export const socket = io("ws://localhost:4000");
socket.once('connect', () => {
	receivedUserId(socket.id);
})
socket.on(SocketEvent.contestSteps, receivedContestInfo);

export { SocketEvent } from "./events.ts";