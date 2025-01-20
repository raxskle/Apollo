import { Editor } from "slate";
import {
  AwaitingConfirm,
  AwaitingWithBuffer,
  Synchronized,
} from "./client-state";
import { EditorAdaptor } from "./editor-adaptor";
import { Operation } from "./operation";
import { SocketAdaptor } from "./socket-adaptor";

export class Client {
  state: Synchronized | AwaitingConfirm | AwaitingWithBuffer;
  revision: number;
  editorAdaptor: EditorAdaptor; // 编辑器适配
  socketAdaptor: SocketAdaptor; // socket适配
  inited: boolean; // 是否已经初始化文档

  constructor(editorAdaptor: Editor) {
    this.state = new Synchronized();
    this.revision = 0;
    this.inited = false;
    this.socketAdaptor = new SocketAdaptor();
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
      console.log(
        "Client.applyClient --- init document >>> Client version",
        this.revision
      );
      return;
    }

    // 本地版本更新
    this.setRevision(operation.targetVersion);

    console.log("client.applyClient>>>>>>>before", this.state);
    this.setState(this.state.applyClient(this, operation));
    console.log("client.applyClient<<<<<<<after", this.state);
  }

  serverAck() {
    console.log("client.serverAck>>>>>>>before", this.state);
    this.setState(this.state.serverAck(this));
    console.log("client.serverAck<<<<<<<after", this.state);
  }

  applyServer(operation: Operation) {
    console.log("client.applyServer>>>>>>>before", this.state);
    this.setState(this.state.applyServer(this, operation));
    console.log("client.applyServer<<<<<<<after", this.state);
  }

  sendOperation(operation: Operation) {
    // 发送op
    // 通过socketAdaptor将op通过socket.io发送到服务端
    this.socketAdaptor.sendData("opFormClient", operation);
  }
  applyOperation(operation: Operation) {
    // 应用op
    // 通过editorAdaptor将op应用到当前文档model
    this.editorAdaptor.applyOperation(this, operation);
  }
}
