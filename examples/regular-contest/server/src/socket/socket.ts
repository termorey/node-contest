import { Server, Socket } from "socket.io";

const io = new Server();

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    console.log("message via chat: " + msg);
    io.emit("chat message", msg);
  });
});

const onConnection: (socket: Socket) => void = (_socket) => {
  console.log("User connected");
};

io.use((socket, _next) => {
  socket.on("connection", onConnection);
  socket.on("error", () => {
    console.log("error");
  });
});

export { io };
