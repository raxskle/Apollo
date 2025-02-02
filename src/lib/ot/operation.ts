import { Operation as SlateOperation } from "slate";
import { CustomOperation } from "../../types/editor";
import {
  arePathsEqual,
  copy,
  isBeforeAndSameParent,
  isBeforeAndSameSibling,
  isParent,
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

    // merge_node 表示path节点向前合并，path长度为1表示父级节点合并，path长度为2表示子级节点合并
    // 父级节点合并，position表示它合并到的子级节点位置
    // 子级节点合并，position表示它和前面的子级节点合并后，offset增加的值

    // split_node 表示path节点向后分裂，path长度为1表示父级节点分裂，path长度为2表示子级节点分裂
    // 子级节点分裂，position表示从该offset位置分裂，后面增加一个节点
    // 父级节点分裂，position表示被分裂到后面的节点的原本的子级节点位置

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
      if (isBeforeAndSameParent(op1.path, op2.path)) {
        // 父级节点合并
        const newPath = [...op1.path];
        newPath[0]--;
        if (op1.path[0] === op2.path[0]) {
          // 如果是该节点向前合并，子级节点要改变
          newPath[1] += op2.position;
        }

        const newOp1 = copy(op1, { path: newPath });
        const newOp2 = copy(op2);
        return [newOp1, newOp2];
      } else if (isBeforeAndSameSibling(op1.path, op2.path)) {
        // 子级节点合并，offset要改变
        const newPath = [...op1.path];
        newPath[1]--;
        let newOffset = op1.offset;
        if (op1.path[1] === op2.path[1]) {
          // op1该节点向前合并，offset要增加
          newOffset += op2.position;
        }

        const newOp1 = copy(op1, { path: newPath, offset: newOffset });
        const newOp2 = copy(op2);
        return [newOp1, newOp2];
      }
    } else if (op1.type === "insert_text" && op2.type === "move_node") {
      // todo 移动节点
    } else if (op1.type === "insert_text" && op2.type === "remove_node") {
      if (isBeforeAndSameParent(op1.path, op2.path)) {
        if (isParent(op1.path, op2.path)) {
          // op1操作的节点被删除了
          const newOp1 = copy(op1, { type: "noop" });
          const newOp2 = copy(op2);
          return [newOp1, newOp2];
        } else {
          // 前面的节点被删除
          const newPath = [...op1.path];
          newPath[0]--;

          const newOp1 = copy(op1, { path: newPath });
          const newOp2 = copy(op2);
          return [newOp1, newOp2];
        }
      } else if (isBeforeAndSameSibling(op1.path, op2.path)) {
        if (arePathsEqual(op1.path, op2.path)) {
          // op1操作的节点被删除了
          const newOp1 = copy(op1, { type: "noop" });
          const newOp2 = copy(op2);
          return [newOp1, newOp2];
        } else {
          // 前面的子级节点被删除
          const newPath = [...op1.path];
          newPath[1]--;

          const newOp1 = copy(op1, { path: newPath });
          const newOp2 = copy(op2);
          return [newOp1, newOp2];
        }
      }
    } else if (op1.type === "insert_text" && op2.type === "set_node") {
      // 看似无冲突
    } else if (op1.type === "insert_text" && op2.type === "split_node") {
      if (isBeforeAndSameParent(op1.path, op2.path)) {
        if (!isParent(op1.path, op2.path)) {
          //  前面的父级节点分裂
          const newPath = [...op1.path];
          newPath[0]++;

          const newOp1 = copy(op1, { path: newPath });
          const newOp2 = copy(op2);
          return [newOp1, newOp2];
        } else if (isParent(op1.path, op2.path)) {
          // 该节点的父节点分裂
          if (op2.position <= op1.path[1]) {
            // 该节点的父节点向下分裂，且分裂位置在该节点之前，父节点+1，子节点-action.position
            const newPath = [...op1.path];
            newPath[0]++;
            newPath[1] -= op2.position;

            const newOp1 = copy(op1, { path: newPath });
            const newOp2 = copy(op2);
            return [newOp1, newOp2];
          }
          // 否则该节点不用动
        }
      } else if (isBeforeAndSameSibling(op1.path, op2.path)) {
        // 子级节点分裂
        if (arePathsEqual(op1.path, op2.path)) {
          // 该节点分裂
          if (op1.offset >= op2.position) {
            // 在该节点前分裂
            const newPath = [...op1.path];
            newPath[1]++;

            let newOffset = op1.offset;
            newOffset -= op2.position;

            const newOp1 = copy(op1, { path: newPath, offset: newOffset });
            const newOp2 = copy(op2);
            return [newOp1, newOp2];
          }
        } else {
          // 前面的节点分裂
          const newPath = [...op1.path];
          newPath[1]++;

          const newOp1 = copy(op1, { path: newPath });
          const newOp2 = copy(op2);
          return [newOp1, newOp2];
        }
      }
    } else if (op1.type === "remove_text" && op2.type === "insert_text") {
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
