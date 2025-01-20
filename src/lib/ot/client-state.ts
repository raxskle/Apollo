import { Client } from "./client";
import { Operation } from "./operation";

// state
export class Synchronized {
  constructor() {}
  applyClient(client: Client, operation: Operation) {
    // 1. 发送op
    // 2. 转换状态AwaitingConfirm
    client.sendOperation(operation);
    return new AwaitingConfirm(operation);
  }
  serverAck() {
    // 无等待ack
    throw new Error("no pending operation");
    return this;
  }
  applyServer(client: Client, operation: Operation) {
    // 1. 直接执行
    client.applyOperation(operation);
    return this;
  }
}

export class AwaitingConfirm {
  outstanding: Operation;

  constructor(outstanding: Operation) {
    this.outstanding = outstanding;
  }

  applyClient(_client: Client, operation: Operation) {
    // 等待ack时又有新的本地操作
    // 1. 缓存新的本地操作buffer
    // ，转换状态AwaitingWithBuffer
    return new AwaitingWithBuffer(this.outstanding, operation);
  }
  serverAck() {
    // 等待ack，且无本地缓存op
    // 1. 转换状态Synchronized
    return new Synchronized();
  }
  applyServer(client: Client, operation: Operation) {
    // 等待ack，本地无缓存op，接收服务端op
    // 1. 转换outstanding和接收的op
    // 2. 执行转换后的op
    // 3. 状态切换到转换后的outstanding

    //
    //                   /\
    // this.outstanding /  \ operation
    //                 /    \
    //                 \    /
    //      op1         \  / outstanding1 (new outstanding)
    //  (can be applied  \/
    //  to the client's
    //  current document)

    const [op1, outstanding1] = operation.transform(this.outstanding);
    client.applyOperation(op1);
    return new AwaitingConfirm(outstanding1);
  }
}

export class AwaitingWithBuffer {
  outstanding: Operation;
  buffer: Operation;

  constructor(outstanding: Operation, buffer: Operation) {
    // 等待ack的op
    this.outstanding = outstanding;
    // 本地缓存的等待发送的op
    this.buffer = buffer;
  }
  applyClient(_client: Client, operation: Operation) {
    // 等待ack，且本地有buffer时
    // 1. 合并buffer
    const newBuffer = this.buffer.compose(operation);
    return new AwaitingWithBuffer(this.outstanding, newBuffer);
  }
  serverAck(client: Client) {
    // 等待ack，且本地有buffer时
    // 1. 发送buffer
    // 2. 转换状态AwaitngConfirm
    client.sendOperation(this.buffer);
    return new AwaitingConfirm(this.buffer);
  }
  applyServer(client: Client, operation: Operation) {
    // 等待ack，本地有缓存buffer，接收服务端op
    // 做两层转换
    // 1. 转换两层
    // 2. 执行转换后的op2
    // 3. 状态切换到转换后的outstanding和buffer
    //
    //                       /\
    //     this.outstanding /  \ operation
    //                     /    \
    //                    /\    /
    //       this.buffer /  \* / outstanding1 (new outstanding)
    //                  /    \/
    //                  \    /
    //           op2     \  / buffer1 (new buffer)
    // the transformed    \/
    // operation -- can
    // be applied to the
    // client's current
    // document
    //
    // * op1

    const [op1, outstanding1] = operation.transform(this.outstanding);
    const [op2, buffer1] = op1.transform(this.buffer);
    client.applyOperation(op2);
    return new AwaitingWithBuffer(outstanding1, buffer1);
  }
}
