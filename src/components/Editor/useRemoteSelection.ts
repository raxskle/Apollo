import { useState } from "react";
import { BasePoint, Node, NodeEntry, Range } from "slate";
import { CustomOperation, CustomText } from "../../types/editor";

import {
  arePathsEqual,
  isBeforeAndSameParent,
  isBeforeAndSameSibling,
  isParent,
} from "../../lib/ot/utils";
import { cloneDeep } from "lodash";

export type RemoteSelection = {
  focus: BasePoint;
  userId: string;
  displayColor: string;
};

const isCustomText = (node: Node): node is CustomText => {
  return "text" in node;
};

export const useRemoteSelection = () => {
  const [remoteSelections, setRemoteSelections] = useState<
    Record<string, RemoteSelection>
  >({});

  const decorate = ([node, path]: NodeEntry): Range[] => {
    const ranges: (Range & {
      isSelection: boolean;
      selectionUser: {
        userId: string;
        displayColor: string;
      };
    })[] = [];

    Object.entries(remoteSelections).forEach(([userId, selection]) => {
      if (!selection || !isCustomText(node) || !path || !selection.focus) {
        return;
      }

      // 计算当前节点与选区的交集
      const intersection = Range.intersection(
        { anchor: selection.focus, focus: selection.focus },
        {
          anchor: { path, offset: 0 },
          focus: { path, offset: node.text.length },
        }
      );

      if (intersection) {
        ranges.push({
          ...intersection,
          isSelection: true,
          selectionUser: {
            userId: userId,
            displayColor: selection.displayColor,
          },
        });
      }
    });

    return ranges;
  };

  const transformSelection = (operations: CustomOperation[]) => {
    // todo: 修改用户光标
    console.log("transformSelection>>>>>>>", operations);
    const selections = cloneDeep(remoteSelections);
    Object.keys(remoteSelections).forEach((userId) => {
      let selection: RemoteSelection | null = cloneDeep(
        remoteSelections[userId]
      );
      console.log("original selection!!!!!!!!", remoteSelections[userId]);
      // 取出每个selection

      operations.forEach((action) => {
        // 对于光标，通过所有operations转换
        // 只需处理action的path和offset在remoteSelection之前的情况
        if (!selection) {
          return;
        }
        if (action.type === "insert_text") {
          if (arePathsEqual(action.path, selection.focus.path)) {
            if (action.offset <= selection.focus.offset) {
              // 插入文本在之前
              selection.focus.offset =
                selection.focus.offset + action.text.length;
            }
          }
        } else if (action.type === "remove_text") {
          if (arePathsEqual(action.path, selection.focus.path)) {
            if (action.offset <= selection.focus.offset) {
              // 移除文本在之前
              selection.focus.offset =
                selection.focus.offset - action.text.length;
            }
          }
        } else if (action.type === "insert_node") {
          if (isBeforeAndSameParent(selection.focus.path, action.path)) {
            selection.focus.path[0]++;
          } else if (
            isBeforeAndSameSibling(selection.focus.path, action.path)
          ) {
            selection.focus.path[1]++;
          }
        } else if (action.type === "merge_node") {
          if (isBeforeAndSameParent(selection.focus.path, action.path)) {
            if (selection.focus.path[0] === action.path[0]) {
              // 该节点向前合并
              selection.focus.path[1] += action.position;
            }
            selection.focus.path[0]--;
          } else if (
            isBeforeAndSameSibling(selection.focus.path, action.path)
          ) {
            if (selection.focus.path[1] === action.path[1]) {
              // 该节点向前合并
              selection.focus.offset += action.position;
            }
            selection.focus.path[1]--;
          }
        } else if (action.type === "move_node") {
          // todo: 处理移动节点的情况
        } else if (action.type === "remove_node") {
          if (isBeforeAndSameParent(selection.focus.path, action.path)) {
            if (isParent(selection.focus.path, action.path)) {
              //  该节点被移除
              selection = null;
            } else {
              selection.focus.path[0]--;
            }
          } else if (
            isBeforeAndSameSibling(selection.focus.path, action.path)
          ) {
            if (arePathsEqual(selection.focus.path, action.path)) {
              // 该节点被移除
              selection = null;
            } else {
              selection.focus.path[1]--;
            }
          }
        } else if (action.type === "set_node") {
          // 不影响
        } else if (action.type === "split_node") {
          if (isBeforeAndSameParent(selection.focus.path, action.path)) {
            if (!isParent(selection.focus.path, action.path)) {
              // 前面分裂
              selection.focus.path[0]++;
            } else if (isParent(selection.focus.path, action.path)) {
              // 该节点的父节点向下分裂
              if (action.position <= selection.focus.path[1]) {
                // 该节点的父节点向下分裂，且分裂位置在该节点之前，父节点+1，子节点-action.position
                selection.focus.path[0]++;
                selection.focus.path[1] -= action.position;
              }
              // 否则该节点不用动
            }
          } else if (
            isBeforeAndSameSibling(selection.focus.path, action.path)
          ) {
            if (arePathsEqual(selection.focus.path, action.path)) {
              if (selection.focus.offset >= action.position) {
                // 该节点前面分裂
                selection.focus.path[1]++;
                selection.focus.offset -= action.position;
              }
            } else {
              // 前面分裂
              selection.focus.path[1]++;
            }
          }
        }
        console.log("selection>>>>>>>", selection);
      });
      console.log("new selection!!!!!!!!", selection);
      if (!selection) {
        // 清除光标
        delete selections[userId];
      } else {
        // 更新光标
        selections[userId] = selection;
      }
    });
    setRemoteSelections(selections);
  };

  return {
    decorate,
    setRemoteSelections,
    remoteSelections,
    transformSelection,
  };
};
