import { Operation as SlateOperation } from "slate";

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
    // transform转换
    // case by case
    return [other, other];
  }

  compose(operation: Operation): Operation {
    // 新的buffer和原本buffer合并
    this.actions = [...this.actions, ...operation.actions];
    return this;
  }
}

type SlateAction = SlateOperation;
