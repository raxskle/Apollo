import {
  AwaitingConfirm,
  AwaitingWithBuffer,
  Synchronized,
} from "./client-state";
import { EditorAdaptor } from "./editor-adaptor";
import { Operation, OperationData } from "./operation";
import { SocketAdaptor } from "./socket-adaptor";

export class Client {
  state: Synchronized | AwaitingConfirm | AwaitingWithBuffer;
  revision: number;
  editorAdaptor: EditorAdaptor; // 编辑器适配
  socketAdaptor: SocketAdaptor; // socket适配

  constructor() {
    this.state = new Synchronized();
    this.revision = 1;
    this.socketAdaptor = new SocketAdaptor();
    this.socketAdaptor.resigterAction<OperationData>("applyServer", (data) => {
      // 需要用箭头函数包裹，否则this会指向socketAdaptor
      // 当收到服务端op时，将data转换为Operation
      const operation = new Operation(data);
      this.applyServer(operation);
    });
    this.editorAdaptor = new EditorAdaptor();
  }
  isAlive() {
    return this.socketAdaptor.isAlive();
  }
  destroy() {
    this.socketAdaptor.destroy();
  }
  setState(state: Synchronized | AwaitingConfirm | AwaitingWithBuffer) {
    this.state = state;
    console.log("SetState", this.state);
  }

  applyClient(operation: Operation) {
    this.setState(this.state.applyClient(this, operation));
  }

  serverAck() {
    this.setState(this.state.serverAck(this));
  }

  applyServer(operation: Operation) {
    console.log("client.applyServer", this.state);
    this.setState(this.state.applyServer(this, operation));
  }

  sendOperation(operation: Operation) {
    // 发送op
    // 通过socketAdaptor将op通过socket.io发送到服务端
    this.socketAdaptor.sendData("applyClient", operation);
  }
  applyOperation(operation: Operation) {
    // 应用op
    // 通过editorAdaptor将op应用到当前文档model
    this.editorAdaptor.applyOperation(operation);
  }
}
