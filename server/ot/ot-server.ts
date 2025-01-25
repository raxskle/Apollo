// OT算法的服务端

import { Socket } from "socket.io";
import { getRandomColor } from "../../src/utils";
import { Document, initialContent } from "../../src/store/docSlice";
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
  receiveOperation(rawOperation: Operation) {
    // server 要做的 transform op
    // 将收到的op，转换为基于服务端最新状态的op
    const operation = this.transformOp(rawOperation);
    console.log(">>>>收到op>>>>转换前后：", rawOperation, operation);

    // 执行op
    if (operation.actions.length > 0 && operation.actions[0].undo) {
      // 如果是撤销
      this.slate.undo();
    } else {
      // 逐个执行action
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

    return operation;
  }
  transformOp(op: Operation) {
    // op是来自客户端的，它是在服务端op之后执行的
    // 将op转换为基于当前版本的op
    const serverVersion = this.document.version;
    if (op.baseVersion === serverVersion) {
      // op基于当前版本
      return op;
    } else {
      // op版本只会小于当前版本
      const index = this.operations.findIndex((item) => {
        return item.baseVersion === op.baseVersion;
      });
      if (index === -1) {
        throw new Error("op版本错误");
      }

      const serverOps = this.operations.slice(index);
      let clientOp = op;
      for (const serverOp of serverOps) {
        // clientOp是后执行的
        const [, op2] = serverOp.transform(clientOp);
        clientOp = op2;
        // [!] op1是服务端的op，不做处理
        // op2
      }
      return clientOp;
    }
  }
}
