// OT算法的服务端

import { Socket } from "socket.io";
import { getRandomColor } from "../../src/utils";
import { Document, initialContent } from "../../src/store/reducers";
import { Operation } from "../../src/lib/ot";
import { Editor, createEditor, withoutNormalizing } from "slate";
import { withHistory } from "slate-history";
import { JSDOM } from "jsdom";

const serverStartTime = Date.now();

const initialDocument = {
  id: "0001",
  title: "文档1",
  content: initialContent,
  lastModified: serverStartTime,
  createdTime: serverStartTime,
  comments: [],
  version: 1,
};

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

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;

export class OTServer {
  clients: Map<string, OTClient>; // 在线的客户端
  document: Document; // 当前文档
  operations: Operation[]; // 记录操作栈
  slate: Editor; // slate示例，用于服务端应用op保持文档同步
  constructor() {
    this.clients = new Map();
    this.document = initialDocument;
    this.operations = [];
    this.slate = withHistory(createEditor());
    this.slate.children = this.document.content;
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
  // 接受文档内容op
  receiveOperation(operation: Operation) {
    // todo：transform op

    // 如果是撤销
    if (operation.actions.length > 0 && operation.actions[0].undo) {
      this.slate.undo();
    } else {
      // 逐个执行op
      withoutNormalizing(this.slate, () => {
        operation.actions.forEach((action, index) => {
          console.log(">>>>执行action", index, action);
          this.slate.apply(action);
        });
      });
    }
    // 记录操作栈
    this.operations.push(operation);
    // 更新文档内容
    this.document.content = this.slate.children;
    this.document.lastModified = Date.now();
    this.document.version = operation.targetVersion;
  }
}
