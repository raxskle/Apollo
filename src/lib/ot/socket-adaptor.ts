import { io, Socket } from "socket.io-client";

export class SocketAdaptor {
  socket: Socket;
  constructor() {
    this.socket = io("http://localhost:3002/", {});
    this.initSocket(this.socket);
  }
  initSocket(socket: Socket) {
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
  destroy() {
    this.socket.disconnect();
  }
  isAlive() {
    return this.socket.connected;
  }
  sendData(method: string, data: unknown) {
    // 发送数据
    this.socket.emit(method, data);
  }
  resigterAction<Data>(method: string, callback: (arg: Data) => void) {
    // 注册回调，收到服务器method时调用cb
    this.socket.on(method, callback);
  }
}
