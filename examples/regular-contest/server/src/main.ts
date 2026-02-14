import { createServer } from "node:http";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { routes } from "./routes";
import { io } from "@/socket/socket.ts";

const PORT = 4000;

// WS
const wsServer = createServer();
io.attach(wsServer);
wsServer.on("listening", () => {
  console.log(`Listening on port ${PORT}`);
});

// App
export const app = new Hono()
  // CORS
  .use(cors())
  // Routes
  .get("/healthcheck", (ctx) => ctx.text("OK", 200))
  .route("/api", routes);

// Server
wsServer.listen(PORT);
export default app;
