import { Socket } from "socket.io-client";

export class SocketAdaptor {
  socket: Socket;
  constructor(socket: Socket) {
    console.log("init socket", socket);
    // this.socket = io("http://localhost:3002/", {});
    this.socket = socket;
    // this.initSocket(this.socket);
  }
  // initSocket(socket: Socket) {
  //   //
  // }
  destroy() {
    console.log("distory socket!!!");
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
  offAction<Data>(method: string, handler: (arg: Data) => void) {
    this.socket.off(method, handler);
  }
}
