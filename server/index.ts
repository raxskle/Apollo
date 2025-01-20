import Koa from "koa";
import { createServer } from "http";
import { Server } from "socket.io";
import { OTServer } from "./ot";

const app = new Koa();
const httpServer = createServer(app.callback());
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const otServer = new OTServer();

io.on("connection", (socket) => {
  console.log("connection", socket.id);
  otServer.clientConnect(socket);
  io.emit("updateUserCount", { data: otServer.getClients() });
  io.emit("initialDocument", otServer.document);

  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
    otServer.clientDisconnect(socket);
    io.emit("updateUserCount", { data: otServer.getClients() });
  });

  // 和Slate调用client的applyClient区分
  socket.on("opFormClient", (msg) => {
    console.log("opFormClient", msg);
    // todo：transform，存储
    otServer.receiveOperation(msg);
    // 发送给其他客户端应用
    socket.broadcast.emit("applyServer", msg);
    // 回复ack
    socket.emit("serverAck", msg);
  });
});

httpServer.listen(3002, () => {
  console.log("listening on *:3002");
});

console.log("start server");
