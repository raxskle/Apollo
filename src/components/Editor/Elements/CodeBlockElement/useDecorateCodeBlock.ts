import { useCallback } from "react";
import { Element, Editor, NodeEntry, Range } from "slate";

export const useDecorateCodeBlock = (editor: Editor) => {
  return useCallback(
    ([node]: NodeEntry): Range[] => {
      if (Element.isElement(node) && node.type === "code-line") {
        const ranges = editor.nodeToDecorations.get(node) || [];
        return ranges;
      }

      return [];
    },
    [editor.nodeToDecorations]
  );
};
