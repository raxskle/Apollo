// OT算法的服务端

import { Socket } from "socket.io";
import { getRandomColor } from "../../src/utils";
import { Document, initialDocument } from "../../src/store/reducers";

export class OTClient {
  socketId: string;
  userName: string;
  displayColor: string;
  constructor(id: string) {
    this.socketId = id;
    this.userName = "USER1";
    this.displayColor = getRandomColor();
  }
}

export class OTServer {
  clients: Map<string, OTClient>; // 在线的客户端
  lastEditTime: number; // 最后编辑时间
  document: Document;
  constructor() {
    this.clients = new Map();
    this.lastEditTime = 0;
    this.document = initialDocument;
  }
  clientConnect(socket: Socket) {
    this.clients.set(socket.id, new OTClient(socket.id));
  }
  clientDisconnect(socket: Socket) {
    this.clients.delete(socket.id);
  }
  getClients() {
    return Array.from(this.clients);
  }
}
