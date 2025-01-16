import Koa from "koa";
import { createServer } from "http";
import { Server } from "socket.io";

const app = new Koa();
const httpServer = createServer(app.callback());
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("connection", socket.id);

  socket.on("hello", (msg) => {
    console.log("hello ", msg);
  });

  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
  });

  socket.on("applyClient", (msg) => {
    console.log("applyClient", msg);
    setTimeout(() => {
      socket.emit("applyServer", msg);
    }, 1000);
  });
});

httpServer.listen(3002, () => {
  console.log("listening on *:3002");
});

console.log("start server");
