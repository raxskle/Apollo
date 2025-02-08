import { cloneDeep } from "lodash";
import { CustomOperation } from "../../types/editor";

export function arePathsEqual(pathA: number[], pathB: number[]): boolean {
  if (pathA.length !== pathB.length) {
    return false;
  }

  for (let i = 0; i < pathA.length; i++) {
    if (pathA[i] !== pathB[i]) {
      return false;
    }
  }

  return true;
}

// b是否是a的或者前面的父级节点，同一祖先节点
export function isBeforeAndSameParent(
  pathA: number[],
  pathB: number[]
): boolean {
  if (pathA.length === 2 && pathB.length === 1 && pathB[0] <= pathA[0]) {
    // 两级节点
    return true;
  }

  if (
    pathA.length === 3 &&
    pathB.length === 2 &&
    pathB[0] === pathA[0] &&
    pathB[1] <= pathA[1]
  ) {
    // 三级节点
    return true;
  }

  return false;
}

// b是否是a同一父节点的前面的同级节点
export function isBeforeAndSameSibling(
  pathA: number[],
  pathB: number[]
): boolean {
  if (pathA.length !== pathB.length) {
    return false;
  }
  if (
    pathA.length === 2 &&
    pathB.length === 2 &&
    pathA[0] === pathB[0] &&
    pathB[1] <= pathA[1]
  ) {
    return true;
  }

  if (
    pathA.length === 3 &&
    pathB.length === 3 &&
    pathA[0] === pathB[0] &&
    pathA[1] === pathB[1] &&
    pathB[2] <= pathA[2]
  ) {
    return true;
  }

  return false;
}

// b是否是a的或者前面的祖先节点
export function isBeforeAndSameAncestor(pathA: number[], pathB: number[]) {
  if (pathA.length === 3 && pathB.length === 1 && pathB[0] <= pathA[0]) {
    return true;
  }

  return false;
}

// b是否是a的父节点
export function isParent(pathA: number[], pathB: number[]): boolean {
  if (pathB.length === 1 && pathA.length === 2 && pathB[0] === pathA[0]) {
    return true;
  }

  if (
    pathB.length === 2 &&
    pathA.length === 3 &&
    pathB[0] === pathA[0] &&
    pathB[1] === pathA[1]
  ) {
    return true;
  }

  return false;
}

// b是否是a的祖先
export function isAncestor(pathA: number[], pathB: number[]) {
  return pathB.length === 1 && pathA.length === 3 && pathB[0] === pathA[0];
}

// 该元素路径是否是三级的
export function isLevelThree(path: number[]) {
  return path.length === 3;
}

export function isLevelTwo(path: number[]) {
  return path.length === 2;
}

export function isLevelOne(path: number[]) {
  return path.length === 1;
}

// 返回该路径的父级路径index
export function parent(path: number[]): number {
  if (path.length === 2) {
    return 0;
  } else if (path.length === 3) {
    return 1;
  }
  throw new Error("path length must be 2 or 3");
}

// 返回该路径的兄弟路径index
export function sibling(path: number[]): number {
  if (path.length === 2) {
    return 1;
  } else if (path.length === 3) {
    return 2;
  } else {
    // 根节点
    return 0;
  }
}

// 返回该路径的祖先路径index
export function ancestor(path: number[]): number {
  if (path.length === 3) {
    return 0;
  }
  throw new Error("path length must be 3");
}

// b是否在a的严格前面，不分层级，不含相同路径和父子祖先关系
export function isPrevious(pathA: number[], pathB: number[]) {
  // a [2,2,4]
  // b [2,2]   // false
  // a [2,3]
  // b [2,2,4] // true

  for (let i = 0; i < pathA.length && i < pathB.length; i++) {
    if (pathB[i] < pathA[i]) {
      return true;
    } else if (pathB[i] > pathA[i]) {
      return false;
    }
    // 相同继续比较
  }

  // 相同或者包含关系
  return false;
}

export const copy = (
  op: CustomOperation,
  options?: Record<string, unknown>
): CustomOperation => {
  let copyOp = cloneDeep(op);

  if (options) {
    copyOp = {
      ...copyOp,
      ...cloneDeep(options),
    };
  }

  return copyOp;
};
