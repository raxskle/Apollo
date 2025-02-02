import Koa from "koa";
import { createServer } from "http";
import { Server } from "socket.io";
import { OTServer } from "./ot";
import { Operation } from "../src/lib/ot";

process.on("uncaughtException", (error) => {
  console.error("捕捉到未捕获的异常:", error.message);
  // 可以在这里进行一些清理工作，然后退出进程
  // process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("捕捉到未处理的Promise拒绝:", reason, promise);
  // 可以在这里进行一些清理工作，然后退出进程
  // process.exit(1);
});

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
  io.emit("updateUserCount", { data: otServer.getClients() }); // 广播
  socket.emit("initialDocument", otServer.document);

  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
    otServer.clientDisconnect(socket);
    io.emit("updateUserCount", { data: otServer.getClients() });
  });

  // 和Slate调用client的applyClient区分
  socket.on("opFormClient", (msg) => {
    console.log("opFormClient", msg);

    const toEmit = otServer.receiveOperation(Operation.formData(msg));

    setTimeout(() => {
      // 发送给其他客户端应用
      socket.broadcast.emit("applyServer", toEmit);
    }, 2000);
    setTimeout(() => {
      // 回复ack
      socket.emit("serverAck", toEmit.operation);
    }, 2000);
  });

  socket.on("changeDocTitle", (msg) => {
    otServer.setDocumentTitle(msg);
    socket.broadcast.emit("changeDocTitle", {
      title: msg,
      lastModified: otServer.getLastModified(),
    });
  });

  // 远端用户选择，广播给其他用户
  socket.on("updateRemoteSelection", (msg) => {
    const client = otServer.getClient(socket.id);
    socket.broadcast.emit("updateRemoteSelection", {
      focus: msg.focus,
      userId: client?.userName ?? "unknown",
      displayColor: client?.displayColor ?? "green",
    });
  });
});

httpServer.listen(3002, () => {
  console.log("listening on *:3002");
});

console.log("start server");
