import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

export const getSocket = (docId?: string) => {
  if (!socket) {
    console.log("socket连接", docId);
    socket = io("http://localhost:3002/", {
      auth: {
        docId: docId,
      },
    });

    socket.on("connect", () => {
      console.log("connect!!", socket?.id);
    });
    socket.on("error", (error) => {
      console.log("socket:error:", error);
    });
    socket.on("disconnect", (reason) => {
      console.log("disconnect", reason);
      socket = undefined;
    });

    socket.emit("hello", "world");
  }

  return socket as Socket;
};
