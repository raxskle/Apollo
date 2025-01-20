import { Operation as SlateOperation } from "slate";

export class Operation {
  actions: SlateAction[];
  constructor(data: SlateAction[]) {
    this.actions = data;
  }
  static formData(data: Operation): Operation {
    return new Operation(data.actions);
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
