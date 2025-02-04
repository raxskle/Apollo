import { useState } from "react";
import { BasePoint, NodeEntry, Range } from "slate";
import { CustomOperation, isCustomText } from "../../types/editor";

import {
  ancestor,
  arePathsEqual,
  isAncestor,
  isBeforeAndSameAncestor,
  isBeforeAndSameParent,
  isBeforeAndSameSibling,
  isParent,
  parent,
  sibling,
} from "../../lib/ot/utils";
import { cloneDeep } from "lodash";
import { User } from "../../store/docSlice";

export type RemoteSelection = {
  focus: BasePoint;
  user: User;
};

export const useRemoteSelection = () => {
  const [remoteSelections, setRemoteSelections] = useState<
    Record<string, RemoteSelection>
  >({});

  const decorateSelection = ([node, path]: NodeEntry): Range[] => {
    const ranges: (Range & {
      isSelection: boolean;
      selectionUser: {
        userName: string;
        displayColor: string;
      };
    })[] = [];

    Object.entries(remoteSelections).forEach(([, selection]) => {
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
            userName: selection.user.name,
            displayColor: selection.user.displayColor,
          },
        });
      }
    });

    return ranges;
  };

  const transformSelection = (operations: CustomOperation[]) => {
    // todo: 修改用户光标
    // console.log("transformSelection>>>>>>>", operations);
    const selections = cloneDeep(remoteSelections);
    Object.keys(remoteSelections).forEach((userId) => {
      let selection: RemoteSelection | null = cloneDeep(
        remoteSelections[userId]
      );
      // console.log("original selection!!!!!!!!", remoteSelections[userId]);
      // 取出每个selection

      operations.forEach((action) => {
        // 对于光标，通过所有operations转换
        // 只需处理action的path和offset在remoteSelection之前的情况
        if (!selection || !selection.focus || !selection.focus.path) {
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
          if (isBeforeAndSameAncestor(selection.focus.path, action.path)) {
            selection.focus.path[ancestor(selection.focus.path)]++;
          } else if (isBeforeAndSameParent(selection.focus.path, action.path)) {
            selection.focus.path[parent(selection.focus.path)]++;
          } else if (
            isBeforeAndSameSibling(selection.focus.path, action.path)
          ) {
            selection.focus.path[sibling(selection.focus.path)]++;
          }
        } else if (action.type === "merge_node") {
          if (isBeforeAndSameAncestor(selection.focus.path, action.path)) {
            selection.focus.path[ancestor(selection.focus.path)]--;
          } else if (isBeforeAndSameParent(selection.focus.path, action.path)) {
            // action是父级节点
            if (
              selection.focus.path[parent(selection.focus.path)] ===
              action.path[sibling(action.path)]
            ) {
              // 该节点向前合并
              selection.focus.path[sibling(selection.focus.path)] +=
                action.position;
            }
            selection.focus.path[parent(selection.focus.path)]--;
          } else if (
            isBeforeAndSameSibling(selection.focus.path, action.path)
          ) {
            if (
              selection.focus.path[sibling(selection.focus.path)] ===
              action.path[sibling(action.path)]
            ) {
              // 该节点向前合并
              selection.focus.offset += action.position;
            }
            selection.focus.path[sibling(selection.focus.path)]--;
          }
        } else if (action.type === "move_node") {
          // todo: 处理移动节点的情况
        } else if (action.type === "remove_node") {
          if (isBeforeAndSameAncestor(selection.focus.path, action.path)) {
            if (isAncestor(selection.focus.path, action.path)) {
              selection = null;
            } else {
              // 前面的祖先
              selection.focus.path[ancestor(selection.focus.path)]--;
            }
          } else if (isBeforeAndSameParent(selection.focus.path, action.path)) {
            if (isParent(selection.focus.path, action.path)) {
              //  该节点被移除
              selection = null;
            } else {
              selection.focus.path[parent(selection.focus.path)]--;
            }
          } else if (
            isBeforeAndSameSibling(selection.focus.path, action.path)
          ) {
            if (arePathsEqual(selection.focus.path, action.path)) {
              // 该节点被移除
              selection = null;
            } else {
              selection.focus.path[sibling(selection.focus.path)]--;
            }
          }
        } else if (action.type === "set_node") {
          // 不影响
        } else if (action.type === "split_node") {
          if (isBeforeAndSameAncestor(selection.focus.path, action.path)) {
            selection.focus.path[ancestor(selection.focus.path)]++;
          } else if (isBeforeAndSameParent(selection.focus.path, action.path)) {
            if (!isParent(selection.focus.path, action.path)) {
              // 前面分裂
              selection.focus.path[parent(selection.focus.path)]++;
            } else if (isParent(selection.focus.path, action.path)) {
              // 该节点的父节点向下分裂
              if (
                action.position <=
                selection.focus.path[sibling(selection.focus.path)]
              ) {
                // 该节点的父节点向下分裂，且分裂位置在该节点之前，父节点+1，子节点-action.position
                selection.focus.path[parent(selection.focus.path)]++;
                selection.focus.path[sibling(selection.focus.path)] -=
                  action.position;
              }
              // 否则该节点不用动
            }
          } else if (
            isBeforeAndSameSibling(selection.focus.path, action.path)
          ) {
            if (arePathsEqual(selection.focus.path, action.path)) {
              if (selection.focus.offset >= action.position) {
                // 该节点前面分裂
                selection.focus.path[sibling(selection.focus.path)]++;
                selection.focus.offset -= action.position;
              }
            } else {
              // 前面分裂
              selection.focus.path[sibling(selection.focus.path)]++;
            }
          }
        }
        // console.log("selection>>>>>>>", selection);
      });
      // console.log("new selection!!!!!!!!", selection);
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
    decorateSelection,
    setRemoteSelections,
    remoteSelections,
    transformSelection,
  };
};
