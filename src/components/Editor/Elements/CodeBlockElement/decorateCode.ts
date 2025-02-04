import { Element } from "slate";
import Prism, { Token } from "prismjs";
import { Editor, NodeEntry, Range, Node } from "slate";
import { useSlateStatic } from "slate-react";
import { CodeBlockElement, isCustomText } from "../../../../types/editor";
import { normalizeTokens } from "../../../../utils/normalizeTokens";
import "prismjs/components/prism-javascript";

export const decorateInlineCode = ([node, path]: NodeEntry): Range[] => {
  const ranges: (Range & {
    code: true;
    token: true;
  })[] = [];

  if (isCustomText(node) && (node.code || node.type === "code")) {
    // 检查所有childen text，如果有code属性或者type为code
    // 那么将这个text转换为prism token，并且转换为range
    // 放到ranges中

    const tokens = Prism.tokenize(node.text, Prism.languages.javascript);
    let start = 0;

    for (const item of tokens) {
      const token = typeof item === "string" ? new Token("plain", item) : item;

      const length = token.content.length;
      if (!length) {
        continue;
      }

      const end = start + length;

      ranges.push({
        anchor: { path, offset: start },
        focus: { path, offset: end },
        code: true,
        token: true,
        [token.type]: true,
      });

      start = end;
    }
  }
  return ranges;
};

// 将block的childen code-line 转换成decorations
const getChildNodeToDecorations = ([
  block,
  blockPath,
]: NodeEntry<CodeBlockElement>) => {
  const nodeToDecorations = new Map<Element, Range[]>();

  const text = block.children.map((line) => Node.string(line)).join("\n");
  const language = block.language ?? "javascript";
  const tokens = Prism.tokenize(text, Prism.languages[language]);
  const normalizedTokens = normalizeTokens(tokens); // make tokens flat and grouped by line
  const blockChildren = block.children as Element[];

  for (let index = 0; index < normalizedTokens.length; index++) {
    const tokens = normalizedTokens[index];
    const element = blockChildren[index];

    if (!nodeToDecorations.has(element)) {
      nodeToDecorations.set(element, []);
    }

    let start = 0;
    for (const token of tokens) {
      const length = token.content.length;
      if (!length) {
        continue;
      }

      const end = start + length;

      const path = [...blockPath, index, 0];
      const range = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true,
        ...Object.fromEntries(token.types.map((type) => [type, true])),
      };

      nodeToDecorations.get(element)!.push(range);

      start = end;
    }
  }

  return nodeToDecorations;
};

export const SetNodeToDecorations = () => {
  const editor = useSlateStatic();

  // 拿到所有code-block
  const blockEntries = Array.from(
    Editor.nodes(editor, {
      at: [],
      mode: "highest",
      match: (n) => Element.isElement(n) && n.type === "code-block",
    })
  );

  const nodeToDecorations = mergeMaps(
    ...blockEntries.map(getChildNodeToDecorations)
  );

  editor.nodeToDecorations = nodeToDecorations;

  return null;
};

// 将多个map合并为一个map
const mergeMaps = <K, V>(...maps: Map<K, V>[]) => {
  const map = new Map<K, V>();

  for (const m of maps) {
    for (const item of m) {
      map.set(...item);
    }
  }

  return map;
};
