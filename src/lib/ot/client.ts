import { Editor } from "slate";
import {
  AwaitingConfirm,
  AwaitingWithBuffer,
  Synchronized,
} from "./client-state";
import { EditorAdaptor } from "./editor-adaptor";
import { Operation } from "./operation";
import { SocketAdaptor } from "./socket-adaptor";
import { Socket } from "socket.io-client";

export class Client {
  state: Synchronized | AwaitingConfirm | AwaitingWithBuffer;
  revision: number;
  editorAdaptor: EditorAdaptor; // 编辑器适配
  socketAdaptor: SocketAdaptor; // socket适配
  inited: boolean; // 是否已经初始化文档

  constructor(editorAdaptor: Editor, socket: Socket) {
    this.state = new Synchronized();
    this.revision = 0;
    this.inited = false;
    this.socketAdaptor = new SocketAdaptor(socket);
    this.socketAdaptor.resigterAction<Operation>(
      "applyServer",
      (operationData: Operation) => {
        // 需要用箭头函数包裹，否则this会指向socketAdaptor
        // 当收到服务端op时，将data转换为Operation
        const operation = Operation.formData(operationData);
        this.applyServer(operation);
      }
    );
    this.socketAdaptor.resigterAction<Operation>("serverAck", () => {
      this.serverAck();
    });
    this.editorAdaptor = new EditorAdaptor(editorAdaptor);
  }
  isAlive() {
    return this.socketAdaptor.isAlive();
  }
  destroy() {
    this.socketAdaptor.destroy();
  }
  setState(state: Synchronized | AwaitingConfirm | AwaitingWithBuffer) {
    this.state = state;
  }
  setRevision(revision: number) {
    this.revision = revision;
  }

  applyClient(operation: Operation) {
    if (!this.inited) {
      // 初始化insert_node文档，不需要状态转换
      this.inited = true;
      // this.setRevision(operation.targetVersion); // 也不需要更新版本
      console.log("applyClient --- init document >>> version", this.revision);
      return;
    }

    // 本地版本更新
    // this.setRevision(operation.targetVersion);

    this.setState(this.state.applyClient(this, operation));
    console.log(`applyClient >>>>>>>> ver:${this.revision} `, this.state);
  }

  serverAck() {
    this.setState(this.state.serverAck(this));
    console.log(`serverAck >>>>>>>> ver:${this.revision} `, this.state);
  }

  applyServer(operation: Operation) {
    this.setState(this.state.applyServer(this, operation));
    console.log(`applyServer >>>>>>>> ver:${this.revision} `, this.state);
  }

  sendOperation(operation: Operation) {
    // 发送op
    // 通过socketAdaptor将op通过socket.io发送到服务端
    this.socketAdaptor.sendData("opFormClient", operation);
  }
  applyOperation(operation: Operation) {
    // 应用op
    // 通过editorAdaptor将op应用到当前文档model
    console.log(
      `applyOperation >>>>>>>> ver:${operation.targetVersion} `,
      operation
    );
    // 设置当前版本号
    this.setRevision(operation.targetVersion);

    this.editorAdaptor.applyOperation(this, operation);
  }
}
