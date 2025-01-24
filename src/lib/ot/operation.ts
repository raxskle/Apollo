import { Operation as SlateOperation } from "slate";
import { CustomOperation } from "../../types/editor";
import {
  arePathsEqual,
  copy,
  isBeforeAndSameParent,
  isBeforeAndSameSibling,
} from "./utils";

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
    // 经过网络传输后丢失method，由data转换为完整op，并不是深拷贝
    return new Operation(data.actions, data.baseVersion);
  }

  // operation是action数组，因为经过了操作堆积时compose
  transform(other: Operation): Array<Operation> {
    // todo: transform转换
    // 由于状态机，transform时，只会有两个可能，要么一个op，要么一个op和buffer
    if (this.baseVersion !== other.baseVersion) {
      // transform基于相同版本
      throw new Error("baseVersion not equal");
    }

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

    return [
      new Operation(ops1, other.targetVersion),
      new Operation(ops2, this.targetVersion),
    ];
  }

  transformAction(op1: CustomOperation, op2: CustomOperation) {
    // action肯定基于相同版本
    // op1 是先应用的，op2是后应用的
    //  action 的类型: "insert_text" | "remove_text" | "set_selection"
    // | "insert_node" | "merge_node" | "move_node"
    // | "remove_node" | "set_node" | "split_node"

    if (op1.type === "insert_text" && op2.type === "insert_text") {
      if (arePathsEqual(op1.path, op2.path)) {
        if (op1.offset <= op2.offset) {
          // op1的位置在op2的前面
          const newOffset = op2.offset + op1.text.length;

          const newOp1 = copy(op1);
          const newOp2 = copy(op2, { offset: newOffset });
          console.log("@@@@@@@ newOp2", op1, op2, newOp2);
          return [newOp1, newOp2];
        } else {
          // op1的位置在op2的后面
          const newOffset = op1.offset + op2.text.length;

          const newOp1 = copy(op1, { offset: newOffset });
          const newOp2 = copy(op2);
          console.log("@@@@@@@ newOp1", op1, op2, newOp1);
          return [newOp1, newOp2];
        }
      }
    } else if (op1.type === "insert_text" && op2.type === "remove_text") {
      if (arePathsEqual(op1.path, op2.path)) {
        if (op1.offset <= op2.offset) {
          // op2位置移后
          const newOffset = op2.offset + op1.text.length;

          const newOp1 = copy(op1);
          const newOp2 = copy(op2, { offset: newOffset });
          console.log("@@@@@@@ newOp1", op1, op2, newOp1);
          return [newOp1, newOp2];
        } else {
          // op1位置移后
          const newOffset = op1.offset - op2.text.length;

          const newOp1 = copy(op1, { offset: newOffset });
          const newOp2 = copy(op2);
          console.log("@@@@@@@ newOp1", op1, op2, newOp1);
          return [newOp1, newOp2];
        }
      }
    } else if (op1.type === "insert_text" && op2.type === "insert_node") {
      if (isBeforeAndSameParent(op1.path, op2.path)) {
        const newPath = [...op1.path];
        newPath[0]++;

        const newOp1 = copy(op1, { path: newPath });
        const newOp2 = copy(op2);
        return [newOp1, newOp2];
      } else if (isBeforeAndSameSibling(op1.path, op2.path)) {
        const newPath = [...op1.path];
        newPath[1]++;

        const newOp1 = copy(op1, { path: newPath });
        const newOp2 = copy(op2);
        return [newOp1, newOp2];
      }
    } else if (op1.type === "insert_text" && op2.type === "merge_node") {
      //
    } else if (op1.type === "insert_text" && op2.type === "move_node") {
      //
    } else if (op1.type === "insert_text" && op2.type === "remove_node") {
      //
    } else if (op1.type === "insert_text" && op2.type === "set_node") {
      //
    } else if (op1.type === "insert_text" && op2.type === "split_node") {
      //
    }

    return [op1, op2];
  }

  compose(operation: Operation): Operation {
    // 新的buffer和原本buffer合并
    this.actions = [...this.actions, ...operation.actions];
    return this;
  }
}

type SlateAction = SlateOperation;
