import { useEffect, useState } from "react";
import { BasePoint, Node, NodeEntry, Range } from "slate";
import { CustomText } from "../../types/editor";

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

  useEffect(() => {
    setRemoteSelections({
      "123": {
        userId: "123",
        displayColor: "pink",
        focus: { path: [0, 0], offset: 3 },
      },
    });
  }, []);

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

  return { decorate, setRemoteSelections };
};
