import { io, Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3002/", {});

    socket.on("connect", () => {
      console.log("connect", socket.id);
    });
    socket.on("error", (error) => {
      console.log("socket:error:", error);
    });
    socket.on("disconnect", (reason) => {
      console.log("disconnect", reason);
    });

    socket.emit("hello", "world");
  }

  return socket;
};
