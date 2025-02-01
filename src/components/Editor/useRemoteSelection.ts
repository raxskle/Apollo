import { useCallback, useState } from "react";
import { BasePoint, Node, NodeEntry, Range } from "slate";
import { CustomText } from "../../types/editor";
import { Operation } from "../../lib/ot";
import { arePathsEqual } from "../../lib/ot/utils";

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

  const transformSelection = useCallback(
    (operation: Operation) => {
      // todo: 修改用户光标
      operation.actions.forEach((action) => {
        // 对于每个action，修改每个remoteSelection
        // 仅处理insert_text, insert_node, remove_text, remove_node
        Object.entries(remoteSelections).forEach(([, selection]) => {
          if (action.type === "insert_text") {
            if (arePathsEqual(action.path, selection.focus.path)) {
              if (action.offset <= selection.focus.offset) {
                // 插入文本在之前
                selection.focus.offset =
                  selection.focus.offset + action.text.length;

                setRemoteSelections((prev) => ({
                  ...prev,
                  [selection.userId]: selection,
                }));
              }
            }
          } else if (action.type === "remove_text") {
            if (arePathsEqual(action.path, selection.focus.path)) {
              if (action.offset <= selection.focus.offset) {
                // 移除文本在之前
                selection.focus.offset =
                  selection.focus.offset - action.text.length;
                setRemoteSelections((prev) => ({
                  ...prev,
                  [selection.userId]: selection,
                }));
              }
            }
          }
        });
      });
    },
    [remoteSelections]
  );

  return {
    decorate,
    setRemoteSelections,
    remoteSelections,
    transformSelection,
  };
};
