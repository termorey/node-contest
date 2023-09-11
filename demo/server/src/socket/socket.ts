import type { Socket } from "socket.io";
import { io } from "../index";
import * as console from "console";

const onConnection: (socket: Socket) => void = (socket) => {
	console.log("User connected");
};

io.use((socket, next) => {
	socket.on("connection", onConnection);
	socket.on("error", () => {
		console.log("error");
	});
});
