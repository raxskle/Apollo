// OT算法的服务端

import { Socket } from "socket.io";
import { Document } from "../../src/store/docSlice";
import { Operation } from "../../src/lib/ot";
import { Descendant, Editor, createEditor, withoutNormalizing } from "slate";
import { withHistory } from "slate-history";
import { JSDOM } from "jsdom";
import { AlignType, CustomElement } from "../../src/types/editor";
import { User } from "../types";

const getInitialDocument = (config: OTServerConfig) => {
  const serverStartTime = Date.now();

  const initialContent: CustomElement[] | Descendant[] = [
    {
      type: "heading-one",
      level: 1,
      align: AlignType.Left,
      children: [{ text: "This is editable heading-one!", italic: true }],
    },
    {
      type: "heading-two",
      level: 2,
      align: AlignType.Left,
      children: [{ text: "This is editable heading-two!" }],
    },
    {
      type: "heading-three",
      level: 3,
      align: AlignType.Left,
      children: [{ text: "This is editable heading-three!" }],
    },
    {
      type: "paragraph",
      align: AlignType.Left,
      children: [
        {
          text: "This is editable plain text, just like a <textarea>!",
        },
      ],
    },
    {
      type: "block-quote",
      children: [
        { text: "This is editable plain text, just like a <textarea>!" },
      ],
    },
    {
      type: "paragraph",
      align: AlignType.Center,
      children: [
        { text: "This is editable ", bold: true },
        { text: "code", code: true },
        { text: " text, just like a <textarea>!" },
      ],
    },
    {
      type: "check-list-item",
      checked: true,
      children: [{ text: "This is a To-do item." }],
    },
    {
      type: "paragraph",
      align: AlignType.Left,
      children: [{ text: "Enjoy the world" }],
    },
    {
      type: "divider",
      children: [{ text: "" }],
    },
    {
      type: "numbered-list",
      children: [
        {
          type: "list-item",
          children: [{ text: "this is a numbered list item 1" }],
        },
        {
          type: "list-item",
          children: [{ text: "this is a numbered list item 2" }],
        },
      ],
    },
    {
      type: "bulleted-list",
      children: [
        {
          type: "list-item",
          children: [{ text: "this is a bulleted list item 1" }],
        },
        {
          type: "list-item",
          children: [{ text: "this is a bulleted list item 2" }],
        },
      ],
    },
    {
      type: "code-block",
      language: "javascript",
      children: [
        { type: "code-line", children: [{ text: "function fn() {" }] },
        { type: "code-line", children: [{ text: "  const a = 1;" }] },
        { type: "code-line", children: [{ text: "}" }] },
      ],
    },
  ];

  const initialDocument: Document = {
    id: config.docId ?? "0001",
    title: "新建文档",
    content: initialContent,
    lastModified: serverStartTime,
    createdTime: serverStartTime,
    comments: [
      {
        ref: {
          type: "heading-one",
          level: 1,
          align: AlignType.Left,
          children: [{ text: "This is editable heading-one!", italic: true }],
        },
        content: "this is a comment",
        author: {
          id: "001",
          name: "raxssdas",

          displayColor: "grey",
        },
        id: "comment001",
        time: 1737896252231,
      },
      {
        ref: {
          type: "heading-three",
          level: 3,
          align: AlignType.Left,
          children: [{ text: "This is editable heading-three!" }],
        },
        content: "this is a comment333333",
        author: {
          id: "001",
          name: "raxssdas",
          displayColor: "grey",
        },
        id: "comment002",
        time: 1737896252231,
      },
      {
        content: "this is a comment333333",
        author: {
          id: "001",
          name: "raxssdas",
          displayColor: "grey",
        },
        id: "comment002",
        time: 1737896252231,
      },
    ],
    version: 1,
  };

  return initialDocument;
};

export class OTClient {
  socketId: string;
  user: User;
  constructor(id: string, user: User) {
    this.socketId = id;
    this.user = user;
  }
}

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;

interface OTServerConfig {
  docId: string;
}
export class OTServer {
  clients: Map<string, OTClient>; // 在线的客户端 socketId => OTClient
  document: Document; // 当前文档
  operations: Operation[]; // 记录操作栈
  slate: Editor; // slate示例，用于服务端应用op保持文档同步
  constructor(config: OTServerConfig) {
    this.clients = new Map();
    this.document = getInitialDocument(config);
    this.operations = [];
    this.slate = withHistory(createEditor());
    this.slate.children = this.document.content;
  }
  clientConnect(socket: Socket, user: User) {
    // todo: 这里改为socketId => AuthUser
    this.clients.set(socket.id, new OTClient(socket.id, user));
  }
  clientDisconnect(socket: Socket) {
    this.clients.delete(socket.id);
  }
  getClient(socketId: string) {
    return this.clients.get(socketId);
  }
  getClients() {
    return Array.from(this.clients);
  }
  setDocumentTitle(title: string) {
    this.document.title = title;
    this.updateLastModified();
  }
  getLastModified() {
    return this.document.lastModified;
  }
  updateLastModified() {
    this.document.lastModified = Date.now();
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
    this.updateLastModified();
    this.document.version = operation.targetVersion;

    return { operation, lastModified: this.document.lastModified };
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
