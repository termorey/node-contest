import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { router } from "./routes";
import cors from "cors";

// Config
const port = 4000;

// Express
export const app = express();

// Http server
const server = createServer(app);

// Socket
export const io = new Server(server, {
	cors: {
		origin: true,
		credentials: true,
	},
});

// CORS
app.use(cors());
// Configuration
app.use(express.json());
// Routes
app.use("/api", router);

// Handlers
io.on("connection", (socket) => {
	console.log("Connected:", socket.id);

	socket.on("disconnect", () => console.log("disconnected"));
});
server.on("error", (err) => {
	console.error("Server not started", err);
});

// Start server
server.listen(port, () => {
	console.log(`Server started on *:${port}`);
});
