export class Operation {
  data: OperationData;
  constructor(data: OperationData) {
    this.data = data;
  }
  transform(other: Operation): Array<Operation> {
    // transform转换
    // case by case
    return [other, other];
  }
  compose(buffer: Operation): Operation {
    // 新的buffer和原本buffer合并
    return buffer;
  }
}

export type OperationData = {
  [key: string]: unknown;
};
