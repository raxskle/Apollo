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

// b是否是a前面的父级节点
export function isBeforeAndSameParent(
  pathA: number[],
  pathB: number[]
): boolean {
  if (pathB.length >= pathA.length) {
    return false;
  }
  if (pathB[0] <= pathA[0]) {
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
  if (pathA[0] !== pathB[0]) {
    return false;
  }
  if (pathB[1] <= pathA[1]) {
    return true;
  }
  return false;
}

// b是否是a的父节点
export function isParent(pathA: number[], pathB: number[]): boolean {
  return pathB.length === 1 && pathA.length === 2 && pathB[0] === pathA[0];
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
