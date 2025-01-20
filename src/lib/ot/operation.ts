import { Operation as SlateOperation } from "slate";
import { CustomOperation } from "../../types/editor";

export class Operation {
  actions: SlateAction[];
  baseVersion: number; // 该操作基于的文档版本
  targetVersion: number; // 该操作应用后的文档版本，如果经过服务端transform，会比baseVersion+1大
  constructor(data: SlateAction[], baseVersion: number) {
    this.actions = data;
    this.baseVersion = baseVersion;
    this.targetVersion = baseVersion + 1;
  }
  static formData(data: Operation): Operation {
    return new Operation(data.actions, data.baseVersion);
  }

  // operation是action数组，因为经过了操作堆积时compose
  transform(other: Operation): Array<Operation> {
    // todo: transform转换
    // case by case
    const ops1 = [...this.actions];
    const ops2 = [...other.actions];

    for (let i = 0; i < ops1.length; i++) {
      for (let j = 0; j < ops2.length; j++) {
        const op1 = ops1[i];
        const op2 = ops2[j];
        const [newOp1, newOp2] = this.transformAction(op1, op2);

        ops1[i] = newOp1;
        ops2[j] = newOp2;
      }
    }
    this.actions = ops1;
    other.actions = ops2;
    return [this, other];
  }

  transformAction(op1: CustomOperation, op2: CustomOperation) {
    return [op1, op2];
  }

  compose(operation: Operation): Operation {
    // 新的buffer和原本buffer合并
    this.actions = [...this.actions, ...operation.actions];
    return this;
  }
}

type SlateAction = SlateOperation;
